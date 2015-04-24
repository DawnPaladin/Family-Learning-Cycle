function newToken(name, rawGrade, height, color) {
	// process value from Grade dropdown
	var gradeObj = { line2Size: "large" };
	switch (rawGrade) {
		case "Preschool":
			gradeObj.line1 = "Pre-";
			gradeObj.line2 = "school";
			gradeObj.line2Size = "small";
			break;
		case "Pre-K":
			gradeObj.line1 = "Pre-";
			gradeObj.line2 = "K";
			break;
		case "Kindergarten":
			gradeObj.line1 = "Kinder-";
			gradeObj.line2 = "garten";
			gradeObj.line2Size = "small";
			break;
		default:
			gradeObj.line1 = "Grade";
			gradeObj.line2 = rawGrade;
			break;
	}

	var tokenIndex = "token" + tokenRegistry.tokenCount++;
	var theToken = new Token(name, gradeObj, height, color);
	tokenRegistry[tokenIndex] = theToken;
	tokenRegistry[tokenIndex].canvasGroup = drawNewToken(10, 200, name, gradeObj, height, color, tokenIndex);
}

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

newPlatform(250, 200, "ECC", 'img/ECC.png');
newPlatform(500, 500, "CTG", 'img/CTG.png');
newPlatform(450, 800, "RTR", 'img/RTR.png');
newPlatform(100, 800, "EXP", 'img/EXP.png');
newPlatform( 50, 500, "MOD", 'img/MOD.png');

document.getElementById("addChildBtn").addEventListener("click", function(){ 
	var name = document.getElementById("nameField").value;
	var grade = document.getElementById("gradeSelect").value;
	var height = Number(document.getElementById("heightSlider").value);
	var color = document.querySelector('input[name = "chooseColor"]:checked').value;
	newToken(name, grade, height, color);
});
//newToken("Twilight Sparkle", "1", 50, "#662D8A");

function orphan(tokenIndex) {
	console.log("Removing " + tokenIndex);
	eraseToken(tokenRegistry[tokenIndex].canvasGroup);
	tokenRegistry[tokenIndex] = {};
}
