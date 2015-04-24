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

//document.getElementById("addChildBtn").addEventListener("click", function(){ newToken("Applejack", "12", 50, "orange");});
newToken("Twilight Sparkle", "1", 50, "#662D8A");

function orphan(tokenIndex) {
	console.log("Removing " + tokenIndex);
	eraseToken(tokenRegistry[tokenIndex].canvasGroup);
	tokenRegistry[tokenIndex] = {};
}
