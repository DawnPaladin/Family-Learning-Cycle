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
			left: platformRegistry[platformIndex].location.x, 
			top: platformRegistry[platformIndex].location.y, 
			selectable: false, 
		}
	);
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

/* === movement === */
function moveTokenToPlatform(tokenData, platform) {
	deregisterTokenFromAllPlatforms(tokenData, true);
	platform.imageObject.dock(tokenData.canvasGroup);
	canvas.renderAll();
}
function moveTokensToPlatform(tokenFormation, platform, increment) {
	for (var i = 0; i < tokenFormation.length; i++) {
		moveTokenToPlatform(tokenFormation[i], platform);
		if (increment)
			incrementGrade(tokenFormation[i].canvasGroup);
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
function walkTokensToPlatform(tokenRoster, platform, increment) {
	var formation = crowdDistribution(platform.imageObject, tokenRoster.length);
	var tokenFormation = musterTokens(tokenRoster);
	for (var i = 0; i < tokenRoster.length; i++) {
		walkToken(tokenFormation[i], formation[i]);
		if (increment)
			incrementGrade(tokenFormation[i].canvasGroup);
		deregisterTokenFromAllPlatforms(tokenFormation[i], false);
		platform.residents.add(tokenRoster[i]);
		tokenFormation[i].canvasGroup.setCoords();
	}
}

function incrementGrade(tokenImage) {
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

canvas.on('mouse:down', function(options){
	if (typeof options.target == "object" && options.target.name == "cycle-btn") {
		var cachedPlatformRegistry = JSON.parse( JSON.stringify( platformRegistry ) );
		for (var i = 0; i < platformRegistry.platformCount; i++) {
			var sourcePlatformName = "platform" + i;
			var targetPlatformCounter = new cyclicCounter(i, platformRegistry.platformCount - 1);
			var targetPlatformName;
			do
				targetPlatformName = "platform" + targetPlatformCounter.increment();
			while (platformRegistry[targetPlatformName].disabled === true);
			//console.log("walkTokensToPlatform(", cachedPlatformRegistry[sourcePlatformName].residents.list, platformRegistry[targetPlatformName], true, ");");
			walkTokensToPlatform(cachedPlatformRegistry[sourcePlatformName].residents.list, platformRegistry[targetPlatformName], true);
		}
	}
});

newPlatform( 50, 200, "Preschool", 'img/Preschool.png');
newPlatform(200, 250, "Pre-K", 'img/Pre-K.png');
newPlatform(350, 200, "Kindergarten", 'img/Kindergarten.png');
newPlatform(500, 250, "LGS", 'img/LGS.png');
newPlatform(650, 200, "ADV", 'img/USH.png'); // "ADV.png" gets hit by AdBlock

newPlatform(325,  500, "ECC", 'img/ECC.png');
newPlatform(600,  800, "CTG", 'img/CTG.png');
newPlatform(550, 1100, "RTR", 'img/RTR.png');
newPlatform(100, 1100, "EXP", 'img/EXP.png');
newPlatform( 50,  800, "MOD", 'img/MOD.png');

newPlatform( 50, 1400, "AHL", 'img/AHL.png');
newPlatform(275, 1425, "WHL", 'img/WHL.png');
newPlatform(500, 1400, "US1", 'img/US1.png');
newPlatform(725, 1425, "US2", 'img/US2.png');

newPlatform(25, 1525, "college", 'img/college.png');

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
