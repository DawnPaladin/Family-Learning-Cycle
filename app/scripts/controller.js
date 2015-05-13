/* Token taxonomy:
	tokenRegistry: Collection of tokenData stored in model.js
	tokenData: Found in tokenRegistry. Stores a tokenImage in tokenData.canvasGroup.
	tokenIndex: Name of tokenData in tokenRegistry. tokenRegistry[tokenIndex] = tokenData
	tokenImage: Canvas/fabric object. Stores a tokenIndex in tokenImage.index so you can get back to tokenData.
	tokenRoster: Array of tokenIndexes.
	tokenFormation: Array of tokenData. musterTokens(tokenRoster) = tokenFormation
	tokenList is ambiguous. Don't use it.
*/

/* === creation and destruction === */
function newToken(name, gradeIndex, height, color) {
	var gradeObj = processGrade(gradeIndex);
	var tokenIndex = "token" + tokenRegistry.tokenCount++;
	var tokenData = new Token(name, gradeObj, height, color);
	tokenRegistry[tokenIndex] = tokenData;
	tokenRegistry[tokenIndex].canvasGroup = drawNewToken(100, 500, name, gradeObj, height, color, tokenIndex);
} //newToken("Twilight Sparkle", "1", 50, "#662D8A");
function orphan(tokenIndex) {
	console.log("Removing " + tokenIndex);
	eraseTokenImage(tokenRegistry[tokenIndex].canvasGroup);
	tokenRegistry[tokenIndex] = {};
}
function newPlatform(x, y, name, url) {
	var thePlatform = new Platform(x, y, name, url);
	var platformIndex = thePlatform.index;
	platformRegistry[platformIndex] = thePlatform;
	fabric.Image.fromURL(
		platformRegistry[platformIndex].url, // path to image
		setupPlatform, // callback after loading image
		{ // options to pass to new image object
			left: platformRegistry[platformIndex].coords.x, 
			top: platformRegistry[platformIndex].coords.y, 
			selectable: false, 
		}
	);
	Locations[name].platformIndex = platformIndex;
	return platformRegistry[platformIndex];
}

/* === utility === */
function lookupCanvasObjectByURL(url) {
	for (var i = 0; i < canvas._objects.length; i++) {
		try {
			if (canvas._objects[i]._element.src.indexOf(url) > 0)
				return canvas._objects[i];
		}
		catch (error) {
			//console.error(error);
		}
	}
}
function lookupPlatformByURL(url) {
	for (var i = 0; i < platformRegistry.platformCount; i++) {
		var platformIndex = "platform" + i;
		var platformURL = platformRegistry[platformIndex].url;
		var endOfPlatformURL = platformURL.substr(platformURL.length - 7);
		var endOfURL = url.substr(url.length - 7);
		if (endOfPlatformURL.indexOf(endOfURL) > -1)
			return platformRegistry[platformIndex];
	}
}

function musterTokens(tokenRoster) { // convert an array of token names to an array of tokens
	var formation = [];
	for (var i = 0; i < tokenRoster.length; i++) {
		formation.push(tokenRegistry[tokenRoster[i]]);
	}
	return formation;
}

function deregisterTokenFromAllPlatforms(tokenData, redistribute) {
	for (var i = 0; i < platformRegistry.platformCount; i++) { // remove token from all previous platforms
		var platformIndex = "platform" + i;
		platformRegistry[platformIndex].residents.remove(tokenData.canvasGroup.index); // remove token from residence in each platform
		if (redistribute)
			distributeCrowd(platformRegistry[platformIndex].imageObject, platformRegistry[platformIndex].residents.list);
	}
}

function clearResidentsFromPlatforms() {
	for (var i = 0; i < platformRegistry.platformCount; i++) {
		var platformIndex = "platform" + i;
		platformRegistry[platformIndex].residents.list = [];
	}
}

function tokensInFLC() {
	var foundFLCPlatform = false;
	for (var i = 0; i < tokenRegistry.tokenCount; i++) {
		var tokenIndex = "token" + i;
		if (tokenRegistry[tokenIndex].location.section == "Investigate")
			foundFLCPlatform = true;
	}
	return foundFLCPlatform;
}

/* === movement === */
function moveTokenToPlatform(tokenData, platform) {
	//deregisterTokenFromAllPlatforms(tokenData, true);
	platform.imageObject.dock(tokenData.canvasGroup);
	canvas.renderAll();
}
function moveTokensToPlatform(tokenFormation, platform, increment) {
	for (var i = 0; i < tokenFormation.length; i++) {
		moveTokenToPlatform(tokenFormation[i], platform);
		if (increment)
			incrementTokenGrade(tokenFormation[i].canvasGroup);
	}
}
function walkToken(tokenData, coords) {
	//console.log("Walk ", tokenData, " to ", coords);
	tokenData.canvasGroup.animate(coords, {
		duration: 750,
		easing: fabric.util.ease.easeInOutCubic,
		onChange: canvas.renderAll.bind(canvas),
	});
}
function walkTokensToPlatform(tokenRoster, platform, incrementGrade, updateRosters) {
	var formation = crowdDistribution(platform.imageObject, tokenRoster.length);
	var tokenFormation = musterTokens(tokenRoster);
	for (var i = 0; i < tokenRoster.length; i++) {
		walkToken(tokenFormation[i], formation[i]);
		if (incrementGrade)
			incrementTokenGrade(tokenFormation[i].canvasGroup);
		if (updateRosters) {
			// update platform information about tokens
			deregisterTokenFromAllPlatforms(tokenFormation[i], false);
			platform.residents.add(tokenRoster[i]);
			// update token information about platforms
			tokenFormation[i].location = platform.location;
		}
		tokenFormation[i].canvasGroup.setCoords();
	}
}

function incrementTokenGrade(tokenImage) {
	var tokenIndex = tokenImage.index;
	var oldGradeIndex = Number(tokenRegistry[tokenIndex].grade.index);
	var newGradeIndex = oldGradeIndex + 1;
	if (newGradeIndex > 14) {
		console.warn("Attempted to increment a grade past 12.");
		newGradeIndex = 14;
	}
	tokenRegistry[tokenIndex].grade = processGrade(newGradeIndex);

	// update canvas object
	var gradeObj = tokenRegistry[tokenIndex].grade;
	tokenImage._objects[5].text = gradeObj.line1;
	tokenImage._objects[6].text = gradeObj.line2;
	if (gradeObj.line2Size == "large")
		tokenImage._objects[6].fontSize = 36;
	else
		tokenImage._objects[6].fontSize = 12;
	canvas.renderAll();
}

function disablePlatform(platform) {
	platform.disabled = true;
	platform.imageObject.opacity = 0.5;
	canvas.renderAll();
}
function enablePlatform(platform) {
	platform.disabled = false;
	platform.imageObject.opacity = 1;
	canvas.renderAll();
}

/* === initialization === */
document.getElementById("addChildBtn").addEventListener("click", function(){ 
	var name = document.getElementById("nameField").value;
	var grade = document.getElementById("gradeSelect").value;
	var height = Number(document.getElementById("heightSlider").value);
	var color = document.querySelector('input[name = "chooseColor"]:checked').value;
	newToken(name, grade, height, color);
});

var cycleYear = Locations.ECC;
canvas.on('mouse:down', function(options){
	if (typeof options.target == "object" && options.target.name == "cycle-btn") {

		if (tokensInFLC()) {
			cycleYear = cycleYear.next;
			disablePlatform(platformRegistry.platform4);
		}
		else {
			cycleYear = Locations.ECC;
			enablePlatform(platformRegistry.platform4);
		}

		// determine changed token locations
		for (var i = 0; i < tokenRegistry.tokenCount; i++) {
			var tokenIndex = "token" + i;
			incrementTokenGrade(tokenRegistry[tokenIndex].canvasGroup);
			var tokenLocation = tokenRegistry[tokenIndex].location;
			if (tokenLocation.section == "Discover") {
				if ((tokenLocation.name == "ADV") || (tokenLocation.name == "LGS" && tokensInFLC()))
					tokenRegistry[tokenIndex].location = cycleYear;
				else
					tokenRegistry[tokenIndex].location = tokenLocation.next;
			}
			if (tokenLocation.section == "Investigate") {
				if (tokenRegistry[tokenIndex].grade.index == 11)
					tokenRegistry[tokenIndex].location = Locations.AHL;
				else
					tokenRegistry[tokenIndex].location = cycleYear;
			}
			if (tokenLocation.section == "Declare") {
				if (tokenLocation.name == "US2")
					tokenRegistry[tokenIndex].location = Locations.college;
				else
					tokenRegistry[tokenIndex].location = tokenLocation.next;
			}
		}

		// special case handling: A token enters ADV when the FLC was just activated
		if (tokensInFLC() && platformRegistry.platform4.residents.list.length > 0) {
			for (var l = 0; l < platformRegistry.platform4.residents.list.length; l++) {
				platformRegistry.platform4.residents.list[l].location = cycleYear;
			}
			disablePlatform(platformRegistry.platform4);
		}

		// move tokens to their new locations
		for (var j = 0; j < platformRegistry.platformCount; j++) {
			var platformIndex = "platform" + j; 
			var platformName = platformRegistry[platformIndex].name;
			var roster = [];
			for (var k = 0; k < tokenRegistry.tokenCount; k++) {
				var tokenIndex = "token" + k; // jshint ignore:line
				if (tokenRegistry[tokenIndex].location.name == platformName)
					roster.push(tokenIndex);
			}
			walkTokensToPlatform(roster, platformRegistry[platformIndex], false, true);
		}

	}
});

newPlatform( 50, 200, "Preschool", 'images/Preschool.png');
newPlatform(200, 250, "Pre-K", 'images/Pre-K.png');
newPlatform(350, 200, "Kindergarten", 'images/Kindergarten.png');
newPlatform(500, 250, "LGS", 'images/LGS.png');
newPlatform(650, 200, "ADV", 'images/USH.png'); // "ADV.png" gets hit by AdBlock

newPlatform(325,  500, "ECC", 'images/ECC.png');
newPlatform(600,  800, "CTG", 'images/CTG.png');
newPlatform(550, 1100, "RTR", 'images/RTR.png');
newPlatform(100, 1100, "EXP", 'images/EXP.png');
newPlatform( 50,  800, "MOD", 'images/MOD.png');

newPlatform( 50, 1400, "AHL", 'images/AHL.png');
newPlatform(275, 1425, "WHL", 'images/WHL.png');
newPlatform(500, 1400, "US1", 'images/US1.png');
newPlatform(725, 1425, "US2", 'images/US2.png');

newPlatform(25, 1525, "college", 'images/college.png');

/*window.setTimeout(function(){ // Generate some default tokens for testing purposes
	newToken("Inkie", "1", 30, "#5377a6");
	newToken("Blinkie", "2", 45, "#dd5b5a");
	newToken("Pinkie", "3", 60, "#f9b5d1");
	newToken("Clyde", "4", 70, "#ffa544");
	for (var i = 0; i < tokenRegistry.tokenCount; i++) {
		moveTokenToPlatform(tokenRegistry["token" + i], platformRegistry.platform0);
	}
}, 500);
*/
