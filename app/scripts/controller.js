/* Token taxonomy:
	model.tokenRegistry: Collection of tokenData stored in model.js
	tokenData: Found in model.tokenRegistry. Stores a tokenImage in tokenData.canvasGroup.
	tokenIndex: Name of tokenData in model.tokenRegistry. model.tokenRegistry[tokenIndex] = tokenData
	tokenImage: Canvas/fabric object. Stores a tokenIndex in tokenImage.index so you can get back to tokenData.
	tokenRoster: Array of tokenIndexes.
	tokenFormation: Array of tokenData. musterTokens(tokenRoster) = tokenFormation
	tokenList is ambiguous. Don't use it.
*/

function flcControllerFactory(model, view, story) {
	var controller = {};

	/* === creation and destruction === */
	controller.tokenPreview = {
		tokenIndex: null,
		spawnCoordsX: 117.5,
		spawnCoordsY: 240,
	};
	controller.tokenPreview.new = function(options) {
		var name = options.nameField.val();
		var grade = options.gradeSelect.val();
		var height = Number(options.heightSlider.val());
		var color = jQuery('input[name = "' + options.colorBoxes + '"]:checked').val();
		var tokenIndex = controller.newToken(name, grade, height, color);
		controller.tokenPreview.tokenIndex = tokenIndex;
	};
	controller.tokenPreview.update = function(tokenIndex, options) {
		var tokenData = model.tokenRegistry[tokenIndex];
		var tokenImage = tokenData.canvasGroup;
		view.eraseTokenImage(tokenImage);
		var name = options.nameField.val();
		var grade = model.processGrade(options.gradeSelect.val());
		var height = Number(options.heightSlider.val());
		var color = jQuery('input[name = "' + options.colorBoxes + '"]:checked').val();
		var x = controller.tokenPreview.spawnCoordsX;
		var y = controller.tokenPreview.spawnCoordsY;
		tokenData.canvasGroup = view.drawNewToken(x, y, name, grade, height, color, tokenIndex, false);
		tokenData.name = name;
		tokenData.grade = grade;
		tokenData.height = height;
		tokenData.color = color;
	};
	controller.tokenPreview.changeHandler = function(options) {
		if (controller.tokenPreview.tokenIndex === null) {
			controller.tokenPreview.new(options);
		} else {
			controller.tokenPreview.update(controller.tokenPreview.tokenIndex, options);
		}
	};
	controller.autoPlaceTokens = function(roster) {
		for (var i = 0; i < roster.length; i++) { // for each token in roster
			var tokenData = model.tokenRegistry[roster[i]];
			var gradeIndex = tokenData.grade.index;
			var platformData = controller.lookupPlatformByGradeIndex(gradeIndex);
			controller.assignTokenToPlatform(tokenData, platformData);
		}
		controller.refreshADV(); // check ADV and do it again
		for (var j = 0; j < roster.length; j++) {
			var tokenData = model.tokenRegistry[roster[j]]; // jshint ignore:line
			var gradeIndex = tokenData.grade.index; // jshint ignore:line
			var platformData = controller.lookupPlatformByGradeIndex(gradeIndex); // jshint ignore:line
			controller.assignTokenToPlatform(tokenData, platformData);
		}
		controller.updateAllTokenLocations();
	};
	controller.newToken = function (name, gradeIndex, height, color, lockMovement) {
		var gradeObj = model.processGrade(gradeIndex);
		var tokenIndex = 'token' + model.tokenCount++;
		var tokenData = new model.Token(name, gradeObj, height, color, lockMovement);
		model.tokenRegistry[tokenIndex] = tokenData;
		model.tokenRegistry[tokenIndex].canvasGroup = view.drawNewToken(controller.tokenPreview.spawnCoordsX, 
			controller.tokenPreview.spawnCoordsY, name, gradeObj, height, color, tokenIndex, lockMovement);
		return tokenIndex;
	};
	controller.dock = function(tokenData, platformData) {
		// down for repairs
		var tokenImage = tokenData.canvasGroup;
		var platformImage = platformData.imageObject;
		tokenImage.top = platformImage.getCenterPoint().y;
		controller.assignTokenToPlatform(tokenData, platformData);
		view.distributeCrowd(platformImage, platformData.residents.list());
		tokenImage.setCoords();
		controller.refreshADV();
		controller.updateFLCMultiOccupacy();
	};
	controller.orphan = function(tokenIndex) {
		console.assert((typeof tokenIndex === "string"), "This is not a tokenIndex:", tokenIndex);
		view.eraseTokenImage(model.tokenRegistry[tokenIndex].canvasGroup);
		model.tokenRegistry[tokenIndex] = { orphaned: true };
		view.orphanage.setSrc('images/trashcan-plain.png', function(){view.canvas.renderAll();});
	};
	controller.hospitalize = function(tokenIndex) {
		console.assert((typeof tokenIndex === "string"), "This is not a tokenIndex:", tokenIndex);
		controller.walkTokensToPlatform([tokenIndex], model.platformRegistry.hospital, false, true);
	};
	controller.newPlatform = function(x, y, name, url) {
		var deferred = jQuery.Deferred();
		var thePlatform = new model.Platform(x, y, name, url);
		var platformIndex = thePlatform.index;
		model.platformRegistry[platformIndex] = thePlatform;	// register platform by serial number...
		model.platformRegistry[name] = thePlatform; 			// ... and by name
		fabric.Image.fromURL(
			model.platformRegistry[platformIndex].url, // path to image
			function(image){ // callback after loading image
				view.canvas.add(image);
				thePlatform.imageObject = image;
				deferred.resolve("Platform is all set up");
			},
			{ // options to pass to new image object
				left: model.platformRegistry[platformIndex].coords.x,
				top: model.platformRegistry[platformIndex].coords.y,
				selectable: false,
			}
		);
		model.Locations[name].platformIndex = platformIndex;
		return deferred.promise();
	};

	view.dropToken = function(options){
		var draggedToken = options.target;
		var tokenIndex = draggedToken.index;
		var tokenData = model.tokenRegistry[tokenIndex];
		if (tokenIndex.indexOf("token") > -1) { // if this is a token
			var foundADock = false; // more predictable behavior if a token overlaps two platforms
			model.tokenRegistry[tokenIndex].location = model.Locations.adrift;
			for (var i = 0; i < model.platformCount; i++) {
				var platformIndex = "platform" + i;
				var platformData = model.platformRegistry[platformIndex];
				model.platformRegistry[platformIndex].residents.remove(tokenIndex); // remove token from residence in each platform
				if (!foundADock && draggedToken.itemInGroupIntersectsWithObject(model.platformRegistry[platformIndex].imageObject)) { // adapted from http://fabricjs.com/intersection/
					controller.dock(tokenData, platformData);
					foundADock = true;
				} else {
					view.distributeCrowd(model.platformRegistry[platformIndex].imageObject, model.platformRegistry[platformIndex].residents.list()); // arrange tokens on the platform the token left
				}
			}
			draggedToken.setCoords();
			controller.refreshADV();
			controller.refreshCycleYear();
			if (!foundADock && draggedToken.intersectsWithObject(view.orphanage)) {
				controller.orphan(tokenIndex);
				foundADock = true;
			}
			controller.updateFLCMultiOccupacy();
		}
	};

	view.canvas.on('object:modified', view.dropToken);
	view.canvas.on('mouse:down', function(options){
		if (typeof options.target === 'object' && options.target.name === 'cycle-btn') {
			if (model.checkForFLCMultiOccupancy() === false) {
				controller.advanceCycle();
			}
		}
		if (typeof options.target === 'object' && options.target.name === 'auto-place-btn') {
			var autoPlaceRoster = model.platformRegistry.staging.residents.list();
			controller.autoPlaceTokens(autoPlaceRoster);
		}
	});

	/* === utility === */
	controller.lookupCanvasObjectByURL = function(url) {
		for (var i = 0; i < view.canvas._objects.length; i++) {
			try {
				if (view.canvas._objects[i]._element.src.indexOf(url) > 0) {
					return view.canvas._objects[i];
				}
			}
			catch (error) {
				//console.error(error);
			}
		}
	};
	controller.lookupPlatformByURL = function(url) {
		for (var i = 0; i < model.platformCount; i++) {
			var platformIndex = 'platform' + i;
			var platformURL = model.platformRegistry[platformIndex].url;
			var endOfPlatformURL = platformURL.substr(platformURL.length - 7);
			var endOfURL = url.substr(url.length - 7);
			if (endOfPlatformURL.indexOf(endOfURL) > -1) {
				return model.platformRegistry[platformIndex];
			}
		}
	};
	controller.lookupPlatformByGradeIndex = function(gradeIndex) {
		gradeIndex = Number(gradeIndex);
		var platformIndex = "platform";
		if (gradeIndex < 4) { // Discover
			platformIndex += gradeIndex; // place according to grade
		} else if (gradeIndex === 4) {
			if (model.platformRegistry.ADV.disabled) {
				platformIndex = model.cycleYear.platformIndex; // place in FLC
			} else {
				platformIndex += gradeIndex; // place according to grade
			}
		} else if (gradeIndex > 4 && gradeIndex < 10){ // Investigate
			platformIndex = model.cycleYear.platformIndex; // place in FLC
		} else if (gradeIndex >= 10) { // Declare
			platformIndex += (gradeIndex - 1); // as of ECC, gradeIndex and tokenIndex no longer match up, because if you're an only child you do ECC twice
		} else {
			console.error("Invalid gradeIndex:", gradeIndex);
		}
		var platformData = model.platformRegistry[platformIndex];
		return platformData;
	};

	controller.musterTokens = function(tokenRoster) { // convert an array of token names to an array of tokens
		console.assert(Array.isArray(tokenRoster), "This is not a tokenRoster:", tokenRoster);
		var formation = [];
		for (var i = 0; i < tokenRoster.length; i++) {
			formation.push(model.tokenRegistry[tokenRoster[i]]);
		}
		return formation;
	};

	controller.deregisterTokenFromAllPlatforms = function(tokenData, redistribute) {
		console.assert((typeof tokenData === "object" && typeof tokenData.name === "string"), "This is not a tokenData:", tokenData);
		for (var i = 0; i < model.platformCount; i++) { // remove token from all previous platforms
			var platformIndex = 'platform' + i;
			model.platformRegistry[platformIndex].residents.remove(tokenData.canvasGroup.index); // remove token from residence in each platform
			if (redistribute) {
				view.distributeCrowd(model.platformRegistry[platformIndex].imageObject, model.platformRegistry[platformIndex].residents.list());
			}
		}
	};

	controller.clearResidentsFromPlatforms = function() {
		for (var i = 0; i < model.platformCount; i++) {
			var platformIndex = 'platform' + i;
			model.platformRegistry[platformIndex].residents.erase();
		}
	};

	controller.tokensInFLC = function() {
		var foundFLCPlatform = false;
		model.forEachToken(function(tokenIndex, tokenData){
			if (tokenData.location && tokenData.location.section === "Investigate") {
				foundFLCPlatform = true;
			}
		});
		return foundFLCPlatform;
	};
	function clone(obj) { // from http://stackoverflow.com/a/728694/1805453
		var copy;

		// Handle the 3 simple types, and null or undefined
		if (null === obj || "object" !== typeof obj) {
			return obj;
		}

		// Handle Date
		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) {
					if (attr === "location") {
						var locationName = obj.location.name;
						copy.location = model.Locations[locationName];
					} else if (attr === "canvasGroup" || attr === "imageObject") {
						// don't copy these recursively
						copy[attr] = obj[attr];
					} else {
						copy[attr] = clone(obj[attr]);
					}
				}
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	/* === movement === */
	controller.moveTokenToPlatform = function(tokenData, platformData) {
		console.assert((typeof tokenData === "object" && typeof tokenData.name === "string"), "This is not a tokenData:", tokenData);
		console.assert((typeof platformData === "object" && typeof platformData.imageObject === "object" && typeof platformData.name === "string"), "This is not a platformData:", platformData);
		//deregisterTokenFromAllPlatforms(tokenData, true);
		controller.dock(tokenData, platformData);
		view.canvas.renderAll();
	};
	controller.moveTokensToPlatform = function(tokenFormation, platformData, increment) {
		console.assert((typeof platformData === "object" && typeof platformData.imageObject === "object" && typeof platformData.name === "string"), "This is not a platformData:", platformData);
		for (var i = 0; i < tokenFormation.length; i++) {
			controller.moveTokenToPlatform(tokenFormation[i], platformData);
			if (increment) {
				controller.incrementTokenGrade(tokenFormation[i].canvasGroup);
			}
		}
	};
	controller.walkToken = function(tokenData, coords) {
		console.assert((typeof tokenData === "object" && typeof tokenData.name === "string"), "This is not a tokenData:", tokenData);
		tokenData.canvasGroup.animate(coords, {
			duration: 750,
			easing: fabric.util.ease.easeInOutCubic,
			onChange: view.canvas.renderAll.bind(view.canvas),
		});
	};
	controller.walkTokensToPlatform = function(tokenRoster, platformData, incrementGrade, updateRosters) {
		console.assert(Array.isArray(tokenRoster), "This is not a tokenRoster:", tokenRoster);
		console.assert((typeof platformData === "object" && typeof platformData.imageObject === "object" && typeof platformData.name === "string"), "This is not a platformData:", platformData);
		var formation = view.crowdDistribution(platformData.imageObject, tokenRoster.length);
		var tokenFormation = controller.musterTokens(tokenRoster);
		for (var i = 0; i < tokenRoster.length; i++) {
			controller.walkToken(tokenFormation[i], formation[i]);
			if (incrementGrade) {
				controller.incrementTokenGrade(tokenFormation[i].canvasGroup);
			}
			if (updateRosters) {
				controller.assignTokenToPlatform(tokenFormation[i], platformData);
			}
			tokenFormation[i].canvasGroup.setCoords();
		}
	};
	controller.assignTokenToPlatform = function(tokenData, platformData) {
		console.assert((typeof tokenData === "object" && typeof tokenData.name === "string"), "This is not a tokenData:", tokenData);
		console.assert((typeof platformData === "object" && typeof platformData.name === "string"), "This is not a platformData:", platformData);
		// update platform information about tokens
		controller.deregisterTokenFromAllPlatforms(tokenData, false);
		platformData.residents.add(tokenData.canvasGroup.index);
		// update token information about platforms
		tokenData.location = platformData.location;
	};
	controller.verifyTokenData = function(log) {
		model.forEachToken(function(tokenIndex, tokenData) {
			var platformIndex = tokenData.location.platformIndex;
			var platformResidents = model.platformRegistry[platformIndex].residents.list();
			if (log) { console.log(tokenIndex, "platform:", platformIndex, "; residents:", platformResidents); }
			console.assert(platformResidents.indexOf(tokenIndex) > -1, platformIndex + " rejects " + tokenIndex + "'s claim of residence.");
		});
	};
	controller.updateAllTokenLocations = function() {
		for (var j = 0; j < model.platformCount; j++) {
			var platformIndex = 'platform' + j;
			var platformName = model.platformRegistry[platformIndex].name;
			var roster = [];
			model.forEachToken(function(tokenIndex, tokenData){ // https://jslinterrors.com/dont-make-functions-within-a-loop
				if (tokenData.location && tokenData.location.name === platformName) {
					roster.push(tokenIndex);
				}
			}); // jshint ignore:line
			controller.walkTokensToPlatform(roster, model.platformRegistry[platformIndex], false, true);
		}
	};
	controller.updateFLCMultiOccupacy = function() {
		if (model.checkForFLCMultiOccupancy()) {
			view.showOccupancyError();
		} else {
			view.hideOccupancyError();
		}
	};

	controller.blankControls = function() {
		document.getElementById('nameField').value = "";
		document.getElementById('gradeSelect').value = "0";
		document.getElementById('heightSlider').value = 45;
		document.querySelector('input[name = "chooseColor"]:checked').checked = false;
		document.querySelector('input[value = "#e77c09"]').checked = true;
	};
	controller.tokenDraggingHandler = function(options) {
		var draggedToken = options.target;
		if (typeof draggedToken.index === "undefined") { return false; } // tried to drag a non-token
		var orphanage = view.orphanage;
		draggedToken.setCoords();
		if (draggedToken.itemInGroupIntersectsWithObject(orphanage)) {
			orphanage.setSrc('images/trashcan-hover.png');
		} else {
			orphanage.setSrc('images/trashcan-plain.png');
		}
		controller.blankControls();
	};
	controller.tokenDraggedHandler = function(options) {
		var draggedToken = options.target;
		controller.tokenPreview.tokenIndex = null;
	};

	controller.incrementTokenGrade = function(tokenImage) {
		console.assert((typeof tokenImage === "object" && typeof tokenImage.canvas === "object" && typeof tokenImage.fill === "string"), "This is not a tokenImage:", tokenImage);
		var tokenIndex = tokenImage.index;
		var oldGradeIndex = Number(model.tokenRegistry[tokenIndex].grade.index);
		var newGradeIndex = oldGradeIndex + 1;
		if (newGradeIndex > 15) {
			newGradeIndex = 15;
		}
		model.tokenRegistry[tokenIndex].grade = model.processGrade(newGradeIndex);
		controller.updateTokenGrade(tokenIndex);
	};

	controller.decrementTokenGrade = function(tokenImage) {
		console.assert((typeof tokenImage === "object" && typeof tokenImage.canvas === "object" && typeof tokenImage.fill === "string"), "This is not a tokenImage:", tokenImage);
		var tokenIndex = tokenImage.index;
		var oldGradeIndex = Number(model.tokenRegistry[tokenIndex].grade.index);
		var newGradeIndex = oldGradeIndex - 1;
		if (newGradeIndex < 0) {
			newGradeIndex = 0;
		}
		model.tokenRegistry[tokenIndex].grade = model.processGrade(newGradeIndex);
		controller.updateTokenGrade(tokenIndex);
	};

	controller.updateTokenGrade = function(tokenIndex) {
		console.assert((typeof tokenIndex === "string"), "This is not a tokenIndex:", tokenIndex);
		var tokenImage = model.tokenRegistry[tokenIndex].canvasGroup;
		var gradeObj = model.tokenRegistry[tokenIndex].grade;
		tokenImage._objects[6].text = gradeObj.line1;
		tokenImage._objects[7].text = gradeObj.line2;
		if (gradeObj.line2Size === 'large') {
			tokenImage._objects[7].fontSize = 36;
		}
		else {
			tokenImage._objects[7].fontSize = 12;
		}
		view.canvas.renderAll();
	};

	controller.disablePlatform = function(platform) {
		console.assert((typeof platform === "object" && typeof platform.imageObject === "object" && typeof platform.name === "string"), "This is not a platformData:", platform);
		platform.disabled = true;
		platform.imageObject.opacity = 0.5;
		view.canvas.renderAll();
	};
	controller.enablePlatform = function(platform) {
		console.assert((typeof platform === "object" && typeof platform.imageObject === "object" && typeof platform.name === "string"), "This is not a platformData:", platform);
		platform.disabled = false;
		platform.imageObject.opacity = 1;
		view.canvas.renderAll();
	};
	controller.advanceCycleYear = function() {
		if (controller.tokensInFLC()) {
			model.cycleYear = model.cycleYear.next;
			view.setCycleYear(model.cycleYear.platformIndex);
		} else {
			model.cycleYear = model.Locations.ECC;
			view.setCycleYear("none");
		}
	};
	controller.refreshCycleYear = function() {
		if (controller.tokensInFLC() === true && model.checkForFLCMultiOccupancy() === false) {
			model.cycleYear = model.calculateCycleYear();
			view.setCycleYear(model.cycleYear.platformIndex);
		} else {
			view.setCycleYear("none");
		}
	};
	controller.refreshADV = function() {
		// enable/disable ADV depending on whether the FLC is active
		if (controller.tokensInFLC()) {
			controller.disablePlatform(model.platformRegistry.platform4);
		} else {
			controller.enablePlatform(model.platformRegistry.platform4);
		}
	};

	controller.forgeBirthCertificate = function(tokenIndex, tokenData) {
		if (typeof model.tokenRegistry.prev === "object") { // if the board has a previous state
			model.tokenRegistry.prev[tokenIndex] = clone(tokenData);
			model.tokenRegistry.prev[tokenIndex].location = model.Locations.hospital;
			model.platformRegistry.prev.hospital.residents.add(tokenIndex);
		}
	};

	controller.advanceCycle = function() {

		// save current state to history
		model.tokenRegistry.prev = clone(model.tokenRegistry);
		model.platformRegistry.prev = clone(model.platformRegistry);

		model.forEachToken(function(tokenIndex, tokenData) {
			controller.incrementTokenGrade(model.tokenRegistry[tokenIndex].canvasGroup);
			if (model.tokenRegistry[tokenIndex].grade.index === 11) { // move 9th graders out of FLC
				model.tokenRegistry[tokenIndex].location = model.Locations.AHL;
			}
		});

		model.cycleYear = model.calculateCycleYear();
		controller.advanceCycleYear();
		controller.refreshADV();
		model.cycleYearHistory.push(model.cycleYear.name);
		var cyclePlatformData = model.platformRegistry[model.cycleYear.name];

		// determine changed token locations
		model.forEachToken(function(tokenIndex, tokenData) {
			var tokenLocation = model.tokenRegistry[tokenIndex].location;
			if (tokenLocation.section === 'Discover') {
				if ((tokenLocation.name === 'ADV') || (tokenLocation.name === 'LGS' && controller.tokensInFLC())) {
					controller.assignTokenToPlatform(tokenData, cyclePlatformData);
				} else {
					controller.assignTokenToPlatform(tokenData, model.platformRegistry[tokenLocation.next.name]);
				}
			}
			if (tokenLocation.section === 'Investigate') {
				controller.assignTokenToPlatform(tokenData, cyclePlatformData); // 9th graders have already been moved in advanceCycle()'s first forEachToken() call
			}
			if (tokenLocation.section === 'Declare') {
				if (model.tokenRegistry[tokenIndex].grade.index === 11) { // just-arrived 9th graders
					// stay put, you've moved already
				} else if (tokenLocation.name === 'US2') {
					controller.assignTokenToPlatform(tokenData, model.platformRegistry.college);
				} else {
					controller.assignTokenToPlatform(tokenData, model.platformRegistry[tokenLocation.next.name]);
				}
			}
		});

		// special case handling: A token enters ADV when the FLC was just activated
		if (controller.tokensInFLC() && model.platformRegistry.platform4.residents.length() > 0) {
			for (var l = 0; l < model.platformRegistry.platform4.residents.length(); l++) {
				controller.assignTokenToPlatform(
					model.tokenRegistry[model.platformRegistry.platform4.residents.list(l)], // tokenData
					model.platformRegistry[model.cycleYear.platformIndex] // platformData
				);
			}
			controller.disablePlatform(model.platformRegistry.platform4);
			view.setCycleYear(model.cycleYear.platformIndex);
		}

		// move tokens to their new locations
		controller.updateAllTokenLocations();
	};

	controller.reverseCycle = function() {

		// restore previous state from history
		try {
			// save current state to futureHistory
			var tokenFutureHistory = clone(model.tokenRegistry);
			var platformFutureHistory = clone(model.platformRegistry);

			model.tokenRegistry = model.tokenRegistry.prev;
			model.platformRegistry = model.platformRegistry.prev;
			model.cycleYear = model.Locations[model.cycleYearHistory[story.currentPage]];
			controller.refreshADV();
			controller.refreshCycleYear();

			model.tokenRegistry.next = tokenFutureHistory;
			model.platformRegistry.next = platformFutureHistory;
		} catch (error) {
			console.warn("Cannot restore board state from history.", error);
		}

		model.forEachToken(function(tokenIndex, tokenData){
			controller.updateTokenGrade(tokenIndex);
		});
		controller.updateAllTokenLocations();

	};

	controller.unReverseCycle = function() {
		// restore previous state from history
		try {
			model.tokenRegistry = model.tokenRegistry.next;
			model.platformRegistry = model.platformRegistry.next;
			model.cycleYear = model.Locations[model.cycleYearHistory[story.currentPage]];
			controller.refreshADV();
			controller.refreshCycleYear();
		} catch (error) {
			console.warn("Cannot restore board state from future-history.", error);
		}

		model.forEachToken(function(tokenIndex, tokenData){
			controller.updateTokenGrade(tokenIndex);
		});
		controller.updateAllTokenLocations();
	};

	controller.turnPageForward = function(){
		var currentPage = story.pages[++story.currentPage];
		if (story.currentPage > story.maxProgress) { // if we are turning a page for the first time
			story.maxProgress = story.currentPage;

			story.box.html(currentPage.text);

			if (currentPage.advance || false) {
				controller.advanceCycle();
			}
			// if page has associated tokens, create them
			if (Array.isArray(currentPage.tokens) || false) {
				for (var i = 0; i < currentPage.tokens.length; i++) {
					var currentToken = currentPage.tokens[i];
					var tokenIndex = controller.newToken.apply(null, currentToken.init);
					story.tokenRegistry[currentToken.name] = tokenIndex;
					var tokenData = model.tokenRegistry[tokenIndex];
					var platformData = model.platformRegistry[currentToken.platform];
					controller.moveTokenToPlatform(tokenData, platformData);
					if (platformData.name === "hospital") { // animate tokens from Hospital to Preschool platform
						controller.assignTokenToPlatform(tokenData, model.platformRegistry.Preschool);
						controller.forgeBirthCertificate(tokenIndex, tokenData);
					}
				}
				currentPage.tokens = undefined; // remove tokens from page to prevent them from being re-created if/when we return to this page
												// now that we're using maxProgress, this is probably unnecessary
				controller.updateAllTokenLocations();
			}
			if (currentPage.triggerFunc) {
				currentPage.triggerFunc();
			}
		} else { // advancing, but not for the first time
			story.box.html(currentPage.text);

			if (currentPage.advance || false) {
				controller.unReverseCycle();
			}

			controller.updateAllTokenLocations();

			if (currentPage.triggerFunc) {
				currentPage.triggerFunc();
			}
		}

		// trigger events to modify controls at beginning and end of story
		if (story.currentPage > 0) {
			story.box.trigger('LeaveFirstPage.'+story.name);
		}
		if (story.currentPage === story.pages.length - 1) {
			story.box.trigger('HitLastPage.'+story.name);
		}

		controller.verifyTokenData();
	};
	controller.turnPageBackward = function(){
		var oldPage = story.pages[story.currentPage];
		var currentPage = story.pages[--story.currentPage];
		story.box.html(currentPage.text);
		if (oldPage.advance || false) {
			controller.reverseCycle();
		}
		if (currentPage.triggerFunc) {
			currentPage.triggerFunc();
		}

		// trigger events to modify controls at beginning and end of story
		if (story.currentPage < 1) {
			story.box.trigger('HitFirstPage.'+story.name);
		}
		if (story.currentPage < story.pages.length) {
			story.box.trigger('LeaveLastPage.'+story.name);
		}
		
		controller.verifyTokenData();
	};

	function christmasGhosts(tokenIndex) {
		var past = "null", present = "null", future = "null";
		try { past = model.tokenRegistry.prev[tokenIndex].location.name; } catch (e) {}
		try { present = model.tokenRegistry[tokenIndex].location.name; } catch (e) {}
		try { future = model.tokenRegistry.next[tokenIndex].location.name; } catch (e) {}
		console.log(past, present, future);
	}

	view.canvas.on("object:moving", controller.tokenDraggingHandler);
	view.canvas.on("object:modified", controller.tokenDraggedHandler);

	return controller;
}
