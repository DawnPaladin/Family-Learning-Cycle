/* Token taxonomy:
	flcToy.model.tokenRegistry: Collection of tokenData stored in model.js
	tokenData: Found in flcToy.model.tokenRegistry. Stores a tokenImage in tokenData.canvasGroup.
	tokenIndex: Name of tokenData in flcToy.model.tokenRegistry. flcToy.model.tokenRegistry[tokenIndex] = tokenData
	tokenImage: Canvas/fabric object. Stores a tokenIndex in tokenImage.index so you can get back to tokenData.
	tokenRoster: Array of tokenIndexes.
	tokenFormation: Array of tokenData. musterTokens(tokenRoster) = tokenFormation
	tokenList is ambiguous. Don't use it.
*/

/* === creation and destruction === */
flcToy.controller.newToken = function (name, gradeIndex, height, color) {
	var gradeObj = flcToy.model.processGrade(gradeIndex);
	var tokenIndex = 'token' + flcToy.model.tokenRegistry.tokenCount++;
	var tokenData = new flcToy.model.Token(name, gradeObj, height, color);
	flcToy.model.tokenRegistry[tokenIndex] = tokenData;
	flcToy.model.tokenRegistry[tokenIndex].canvasGroup = flcToy.view.drawNewToken(100, 500, name, gradeObj, height, color, tokenIndex);
	return tokenIndex;
}; //newToken('Twilight Sparkle', '1', 50, '#662D8A');
flcToy.controller.orphan = function(tokenIndex) {
	console.log('Removing ' + tokenIndex);
	flcToy.view.eraseTokenImage(flcToy.model.tokenRegistry[tokenIndex].canvasGroup);
	flcToy.model.tokenRegistry[tokenIndex] = {};
};
flcToy.controller.newPlatform = function(x, y, name, url) {
	var thePlatform = new flcToy.model.Platform(x, y, name, url);
	var platformIndex = thePlatform.index;
	flcToy.model.platformRegistry[platformIndex] = thePlatform;
	fabric.Image.fromURL(
		flcToy.model.platformRegistry[platformIndex].url, // path to image
		flcToy.view.setupPlatform, // callback after loading image
		{ // options to pass to new image object
			left: flcToy.model.platformRegistry[platformIndex].coords.x, 
			top: flcToy.model.platformRegistry[platformIndex].coords.y, 
			selectable: false, 
		}
	);
	flcToy.model.Locations[name].platformIndex = platformIndex;
	return flcToy.model.platformRegistry[platformIndex];
};

/* === utility === */
flcToy.controller.lookupCanvasObjectByURL = function(url) {
	for (var i = 0; i < flcToy.view.canvas._objects.length; i++) {
		try {
			if (flcToy.view.canvas._objects[i]._element.src.indexOf(url) > 0) {
				return flcToy.view.canvas._objects[i];
			}
		}
		catch (error) {
			//console.error(error);
		}
	}
};
flcToy.controller.lookupPlatformByURL = function(url) {
	for (var i = 0; i < flcToy.model.platformRegistry.platformCount; i++) {
		var platformIndex = 'platform' + i;
		var platformURL = flcToy.model.platformRegistry[platformIndex].url;
		var endOfPlatformURL = platformURL.substr(platformURL.length - 7);
		var endOfURL = url.substr(url.length - 7);
		if (endOfPlatformURL.indexOf(endOfURL) > -1) {
			return flcToy.model.platformRegistry[platformIndex];
		}
	}
};

flcToy.controller.musterTokens = function(tokenRoster) { // convert an array of token names to an array of tokens
	var formation = [];
	for (var i = 0; i < tokenRoster.length; i++) {
		formation.push(flcToy.model.tokenRegistry[tokenRoster[i]]);
	}
	return formation;
};

flcToy.controller.deregisterTokenFromAllPlatforms = function(tokenData, redistribute) {
	for (var i = 0; i < flcToy.model.platformRegistry.platformCount; i++) { // remove token from all previous platforms
		var platformIndex = 'platform' + i;
		flcToy.model.platformRegistry[platformIndex].residents.remove(tokenData.canvasGroup.index); // remove token from residence in each platform
		if (redistribute) {
			flcToy.view.distributeCrowd(flcToy.model.platformRegistry[platformIndex].imageObject, flcToy.model.platformRegistry[platformIndex].residents.list);
		}
	}
};

flcToy.controller.clearResidentsFromPlatforms = function() {
	for (var i = 0; i < flcToy.model.platformRegistry.platformCount; i++) {
		var platformIndex = 'platform' + i;
		flcToy.model.platformRegistry[platformIndex].residents.list = [];
	}
};

flcToy.controller.tokensInFLC = function() {
	var foundFLCPlatform = false;
	for (var i = 0; i < flcToy.model.tokenRegistry.tokenCount; i++) {
		var tokenIndex = 'token' + i;
		if (flcToy.model.tokenRegistry[tokenIndex].location.section === 'Investigate') {
			foundFLCPlatform = true;
		}
	}
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
            		copy.location = flcToy.model.Locations[locationName];
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
flcToy.controller.moveTokenToPlatform = function(tokenData, platform) {
	//deregisterTokenFromAllPlatforms(tokenData, true);
	platform.imageObject.dock(tokenData.canvasGroup);
	flcToy.view.canvas.renderAll();
};
flcToy.controller.moveTokensToPlatform = function(tokenFormation, platform, increment) {
	for (var i = 0; i < tokenFormation.length; i++) {
		flcToy.controller.moveTokenToPlatform(tokenFormation[i], platform);
		if (increment) {
			flcToy.controller.incrementTokenGrade(tokenFormation[i].canvasGroup);
		}
	}
};
flcToy.controller.walkToken = function(tokenData, coords) {
	//console.log('Walk ', tokenData, ' to ', coords);
	tokenData.canvasGroup.animate(coords, {
		duration: 750,
		easing: fabric.util.ease.easeInOutCubic,
		onChange: flcToy.view.canvas.renderAll.bind(flcToy.view.canvas),
	});
};
flcToy.controller.walkTokensToPlatform = function(tokenRoster, platform, incrementGrade, updateRosters) {
	var formation = flcToy.view.crowdDistribution(platform.imageObject, tokenRoster.length);
	var tokenFormation = flcToy.controller.musterTokens(tokenRoster);
	for (var i = 0; i < tokenRoster.length; i++) {
		flcToy.controller.walkToken(tokenFormation[i], formation[i]);
		if (incrementGrade) {
			flcToy.controller.incrementTokenGrade(tokenFormation[i].canvasGroup);
		}
		if (updateRosters) {
			// update platform information about tokens
			flcToy.controller.deregisterTokenFromAllPlatforms(tokenFormation[i], false);
			platform.residents.add(tokenRoster[i]);
			// update token information about platforms
			tokenFormation[i].location = platform.location;
		}
		tokenFormation[i].canvasGroup.setCoords();
	}
};
flcToy.controller.updateAllTokenLocations = function() {
	for (var j = 0; j < flcToy.model.platformRegistry.platformCount; j++) {
		var platformIndex = 'platform' + j; 
		var platformName = flcToy.model.platformRegistry[platformIndex].name;
		var roster = [];
		for (var k = 0; k < flcToy.model.tokenRegistry.tokenCount; k++) {
			var tokenIndex = 'token' + k; // jshint ignore:line
			if (flcToy.model.tokenRegistry[tokenIndex].location.name === platformName) {
				roster.push(tokenIndex);
			}
		}
		flcToy.controller.walkTokensToPlatform(roster, flcToy.model.platformRegistry[platformIndex], false, true);
	}
};

flcToy.controller.incrementTokenGrade = function(tokenImage) {
	var tokenIndex = tokenImage.index;
	var oldGradeIndex = Number(flcToy.model.tokenRegistry[tokenIndex].grade.index);
	var newGradeIndex = oldGradeIndex + 1;
	if (newGradeIndex > 15) {
		newGradeIndex = 15;
	}
	flcToy.model.tokenRegistry[tokenIndex].grade = flcToy.model.processGrade(newGradeIndex);

	// update canvas object
	var gradeObj = flcToy.model.tokenRegistry[tokenIndex].grade;
	tokenImage._objects[5].text = gradeObj.line1;
	tokenImage._objects[6].text = gradeObj.line2;
	if (gradeObj.line2Size === 'large') {
		tokenImage._objects[6].fontSize = 36;
	}
	else {
		tokenImage._objects[6].fontSize = 12;
	}
	flcToy.view.canvas.renderAll();
};

flcToy.controller.disablePlatform = function(platform) {
	platform.disabled = true;
	platform.imageObject.opacity = 0.5;
	flcToy.view.canvas.renderAll();
};
flcToy.controller.enablePlatform = function(platform) {
	platform.disabled = false;
	platform.imageObject.opacity = 1;
	flcToy.view.canvas.renderAll();
};

/* === initialization === */

flcToy.cycleYear = flcToy.model.Locations.ECC;

document.getElementById('addChildBtn').addEventListener('click', function(){ 
	var name = document.getElementById('nameField').value;
	var grade = document.getElementById('gradeSelect').value;
	var height = Number(document.getElementById('heightSlider').value);
	var color = document.querySelector('input[name = "chooseColor"]:checked').value;
	flcToy.controller.newToken(name, grade, height, color);
	document.getElementById('nameField').value = "";
	document.getElementById('gradeSelect').value = "0";
	document.getElementById('heightSlider').value = 45;
	document.querySelector('input[name = "chooseColor"]:checked').checked = false;
	document.querySelector('input[value = "#dd5b5a"]').checked = true;
});

flcToy.controller.advanceCycle = function() {

	// save current state to history
	flcToy.model.tokenRegistry.prev = clone(flcToy.model.tokenRegistry);
	flcToy.model.platformRegistry.prev = clone(flcToy.model.platformRegistry);

	// enable/disable ADV depending on whether the FLC is active
	if (flcToy.controller.tokensInFLC()) {
		flcToy.cycleYear = flcToy.cycleYear.next;
		flcToy.controller.disablePlatform(flcToy.model.platformRegistry.platform4);
	}
	else {
		flcToy.cycleYear = flcToy.model.Locations.ECC;
		flcToy.controller.enablePlatform(flcToy.model.platformRegistry.platform4);
	}

	// determine changed token locations
	for (var i = 0; i < flcToy.model.tokenRegistry.tokenCount; i++) {
		var tokenIndex = 'token' + i;
		flcToy.controller.incrementTokenGrade(flcToy.model.tokenRegistry[tokenIndex].canvasGroup);
		var tokenLocation = flcToy.model.tokenRegistry[tokenIndex].location;
		if (tokenLocation.section === 'Discover') {
			if ((tokenLocation.name === 'ADV') || (tokenLocation.name === 'LGS' && flcToy.controller.tokensInFLC())) {
				flcToy.model.tokenRegistry[tokenIndex].location = flcToy.cycleYear;
			}
			else {
				//console.log(tokenRegistryCopy.token0.location.name);
				flcToy.model.tokenRegistry[tokenIndex].location = tokenLocation.next;
				//console.log(tokenRegistryCopy.token0.location.name);
			}
		}
		if (tokenLocation.section === 'Investigate') {
			if (flcToy.model.tokenRegistry[tokenIndex].grade.index === 11) {
				flcToy.model.tokenRegistry[tokenIndex].location = flcToy.model.Locations.AHL;
			}
			else {
				flcToy.model.tokenRegistry[tokenIndex].location = flcToy.cycleYear;
			}
		}
		if (tokenLocation.section === 'Declare') {
			if (tokenLocation.name === 'US2') {
				flcToy.model.tokenRegistry[tokenIndex].location = flcToy.model.Locations.college;
			}
			else {
				flcToy.model.tokenRegistry[tokenIndex].location = tokenLocation.next;
			}
		}
	}

	// special case handling: A token enters ADV when the FLC was just activated
	if (flcToy.controller.tokensInFLC() && flcToy.model.platformRegistry.platform4.residents.list.length > 0) {
		for (var l = 0; l < flcToy.model.platformRegistry.platform4.residents.list.length; l++) {
			flcToy.model.platformRegistry.platform4.residents.list[l].location = flcToy.cycleYear;
		}
		flcToy.controller.disablePlatform(flcToy.model.platformRegistry.platform4);
	}

	// move tokens to their new locations
	flcToy.controller.updateAllTokenLocations();
};

flcToy.controller.reverseCycle = function() {

	// restore previous state from history
	try {
		flcToy.model.tokenRegistry = flcToy.model.tokenRegistry.prev;
		flcToy.model.platformRegistry = flcToy.model.platformRegistry.prev;
	} catch (error) {
		console.err("Cannot restore board state from history.");
	}

	flcToy.controller.updateAllTokenLocations();

};

flcToy.view.canvas.on('mouse:down', function(options){
	if (typeof options.target === 'object' && options.target.name === 'cycle-btn') {
		flcToy.controller.advanceCycle();
	}
});

(function() {
	var DiscoverBaseX = 90;
	var DiscoverBaseY = 200;
	flcToy.controller.newPlatform(DiscoverBaseX +  0, DiscoverBaseY +  0, 'Preschool', 'images/Preschool.png');
	flcToy.controller.newPlatform(DiscoverBaseX + 150, DiscoverBaseY + 50, 'Pre-K', 'images/Pre-K.png');
	flcToy.controller.newPlatform(DiscoverBaseX + 300, DiscoverBaseY +  0, 'Kindergarten', 'images/Kindergarten.png');
	flcToy.controller.newPlatform(DiscoverBaseX + 450, DiscoverBaseY + 50, 'LGS', 'images/LGS.png');
	flcToy.controller.newPlatform(DiscoverBaseX + 600, DiscoverBaseY +  0, 'ADV', 'images/USH.png'); // 'ADV.png' gets hit by AdBlock

	var InvestigateBase = DiscoverBaseY + 300;
	flcToy.controller.newPlatform(325, InvestigateBase +   0, 'ECC', 'images/ECC.png');
	flcToy.controller.newPlatform(600, InvestigateBase + 250, 'CTG', 'images/CTG.png');
	flcToy.controller.newPlatform(550, InvestigateBase + 500, 'RTR', 'images/RTR.png');
	flcToy.controller.newPlatform(100, InvestigateBase + 500, 'EXP', 'images/EXP.png');
	flcToy.controller.newPlatform( 50, InvestigateBase + 250, 'MOD', 'images/MOD.png');

	var DeclareBase = InvestigateBase + 850;
	flcToy.controller.newPlatform( 50, DeclareBase +  0, 'AHL', 'images/AHL.png');
	flcToy.controller.newPlatform(275, DeclareBase + 25, 'WHL', 'images/WHL.png');
	flcToy.controller.newPlatform(500, DeclareBase +  0, 'US1', 'images/US1.png');
	flcToy.controller.newPlatform(725, DeclareBase + 25, 'US2', 'images/US2.png');

	flcToy.controller.newPlatform( 25, 1600, 'college', 'images/college.png');
}());

/*window.setTimeout(function(){ // Generate some default tokens for testing purposes
	newToken('Inkie', '1', 30, '#5377a6');
	newToken('Blinkie', '2', 45, '#dd5b5a');
	newToken('Pinkie', '3', 60, '#f9b5d1');
	newToken('Clyde', '4', 70, '#ffa544');
	for (var i = 0; i < flcToy.model.tokenRegistry.tokenCount; i++) {
		moveTokenToPlatform(flcToy.model.tokenRegistry['token' + i], flcToy.model.platformRegistry.platform0);
	}
}, 500);
*/
