function newToken(name, grade, height, color) {
	var tokenIndex = "token" + tokenRegistry.tokenCount++;
	var theToken = new Token(name, grade, height, color);
	tokenRegistry[tokenIndex] = theToken;
	drawNewToken(10, 200, height, color);
}

document.getElementById("addChildBtn").addEventListener("click", function(){ newToken("Applejack", "12th grade", 50, "orange");});
