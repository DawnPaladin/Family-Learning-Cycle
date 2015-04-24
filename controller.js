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

document.getElementById("addChildBtn").addEventListener("click", function(){ 
	var name = document.getElementById("nameField").value;
	var grade = document.getElementById("gradeSelect").value;
	var height = Number(document.getElementById("heightSlider").value);
	var color = document.querySelector('input[name = "chooseColor"]:checked').value;
	console.log(name, grade, height, color);
	newToken(name, grade, height, color);
});
//newToken("Twilight Sparkle", "1", 50, "#662D8A");

function orphan(tokenIndex) {
	console.log("Removing " + tokenIndex);
	eraseToken(tokenRegistry[tokenIndex].canvasGroup);
	tokenRegistry[tokenIndex] = {};
}
