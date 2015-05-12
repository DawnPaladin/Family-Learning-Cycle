var tokenRegistry = { tokenCount: 0 };
var platformRegistry = { platformCount: 0 };

function Token(name, grade, height, color) { // class definition
	this.name = name;
	this.grade = grade;
	this.height = height;
	this.color = color;
	this.coords = {x: 0, y: 0};
	this.canvasGroup = null;
	this.location = null;
}

function Platform(x, y, name, url) {
	this.coords = {x: x, y: y};
	this.name = name;
	this.url = url;
	this.location = Locations[name];
	this.index = "platform" + platformRegistry.platformCount++;
	this.residents = { list: [] };
	this.imageObject = null;
	this.disabled = false;
	var residentRegistry = this.residents;
	var platformName = this.name;
	residentRegistry.add = function(tokenIndex) {
		//console.log("Adding", tokenIndex, "to", platformName, "registry, called by", arguments.callee.caller.toString());
		residentRegistry.list.push(tokenIndex);
	};
	residentRegistry.find = function(tokenIndex) {
		for (var i = 0; i < residentRegistry.list.length; i++) {
			if (residentRegistry.list[i].indexOf(tokenIndex) > -1)
				return i;
		}
		return -1;
	};
	residentRegistry.remove = function(tokenIndex) {
		var arrayIndex = residentRegistry.find(tokenIndex);
		if (arrayIndex > -1)
			residentRegistry.list.splice(arrayIndex, 1);
	};
}

function List(){
	List.makeNode = function(name, sectionName) {
		return {
			name: name,
			section: sectionName,
			next: null,
			platformIndex: null,
		};
	};
	this.add = function(array, sectionName, listType) {
		for (var i = 0; i < array.length; i++) {
			this[array[i]] = List.makeNode(array[i], sectionName);
		}
		for (var j = 0; j < array.length; j++) {
			this[array[j]].next = this[array[j+1]];
		}
		this.first = this[array[0]];
		this.last = this[array[array.length - 1]];
		if (listType == "circular") {
			this.last.next = this.first;
		}
	};
}

var Locations = new List();
Locations.add(["Preschool", "Pre-K", "Kindergarten", "LGS", "ADV"], "Discover");
Locations.add(["ECC", "CTG", "RTR", "EXP", "MOD"], "Investigate", "circular");
Locations.add(["AHL", "WHL", "US1", "US2"], "Declare");
Locations.college = List.makeNode("college", "other");
Locations.orphanage = List.makeNode("orphanage", "other");

function CyclicCounter(initial, minimum, maximum) {
	this.counter = initial;
	this.minimum = minimum;
	this.maximum = maximum;
	if (this.initial > this.maximum || this.initial < this.minimum)
		this.counter = this.minimum;
	this.increment = function(){
		if (++this.counter > maximum)
			this.counter = this.minimum;
		return this.counter;
	};
}
function LinearCounter(initial) {
	this.counter = initial;
	this.increment = function() {
		return ++this.counter;
	};
}

function processGrade(gradeIndex) {
	// process value from Grade dropdown
	var gradeLevels = ["Preschool", "Pre-K", "Kindergarten", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
	var gradeText = gradeLevels[gradeIndex];
	var gradeObj = { 
		index: gradeIndex, 
		line2Size: "large" 
	};
	switch (gradeText) {
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
			gradeObj.line2 = gradeText;
			break;
	}
	return gradeObj;
}
;var canvas = new fabric.Canvas("FamilyLearningCycleToy");

var PERSON_WIDTH = 50;
var HEAD_RADIUS = PERSON_WIDTH / 2;
var PLATFORM_ELBOW_ROOM = 20;
var debugging = false;

var orphanage = new fabric.Rect({
	width: 972,
	height: 100,
	left: 0,
	top: 1700,
	fill: "#F2F2F2",
	selectable: false,
});
canvas.add(orphanage);
fabric.Image.fromURL('img/cycle-btn.png', function(loadedImage) {
	canvas.add(loadedImage);
}, {
	selectable: true,
	left: 400,
	top: 750,
	hoverCursor: "pointer",
	hasControls: false,
	hasBorders: false,
	lockMovementX: true,
	lockMovementY: true,
	name: "cycle-btn",
});

function setupPlatform(image) {
	canvas.add(image); 
	canvas.sendToBack(image);
	var platform = lookupPlatformByURL(image._element.src);

	image.dock = function(token) {
		//console.log("Docking " + token + " into " + image);
		token.top = image.getCenterPoint().y;
		platform.residents.add(token.index);
		tokenRegistry[token.index].location = platform.location;
		distributeCrowd(image, platform.residents.list);
		token.setCoords();
	};
	platform.imageObject = image;
}

function distributeCrowd(platformImage, residentsList) { // distribute crowd of tokens across the platform
	var crowdWidth = (residentsList.length - 1) * PERSON_WIDTH + (residentsList.length - 1) * PLATFORM_ELBOW_ROOM; // distance between first and last midpoints
	var crowdLeftEdge = -crowdWidth / 2;
	for (var i = 0; i < residentsList.length; i++) {
		var offsetFromCenter = crowdLeftEdge + (PERSON_WIDTH + PLATFORM_ELBOW_ROOM) * i;
		tokenRegistry[residentsList[i]].canvasGroup.left = platformImage.getCenterPoint().x + offsetFromCenter;
		tokenRegistry[residentsList[i]].canvasGroup.setCoords();
	}
}

function crowdDistribution(originImageObject, memberCount) {
	var crowdWidth = (memberCount - 1) * PERSON_WIDTH + (memberCount - 1) * PLATFORM_ELBOW_ROOM;
	var crowdLeftEdge = -crowdWidth / 2;
	var memberLocations = [];
	var y = originImageObject.getCenterPoint().y;
	for (var i = 0; i < memberCount; i++) {
		var offsetFromCenter = crowdLeftEdge + (PERSON_WIDTH + PLATFORM_ELBOW_ROOM) * i;
		var x = originImageObject.getCenterPoint().x + offsetFromCenter;
		memberLocations.push({left: x, top:y});
	}
	return memberLocations;
}

function drawNewToken(x, y, name, gradeObj, height, color, tokenIndex) {
	var head = new fabric.Circle({
		radius: HEAD_RADIUS,
		left: 0.5, // half-pixel offset to prevent fuzzy antialiasing
	});
	var shoulders = new fabric.Circle({
		radius: HEAD_RADIUS,
		top: HEAD_RADIUS*2.5,
		left: 0.5,
	});
	var torso = new fabric.Rect({
		width: PERSON_WIDTH,
		height: height,
		top: HEAD_RADIUS*3.5,
		left: 0.5,
	});
	var base = new fabric.Circle({
		radius: HEAD_RADIUS,
		top: HEAD_RADIUS*2.5 + height,
		left: 0.5,
	});
	var nameplate = new fabric.Text(name, {
		fontFamily: "Source Sans Pro",
		fontSize: 20,
		top: -28,
		left: HEAD_RADIUS,
		originX: "center",
	});
	var gradeLine1 = new fabric.Text(gradeObj.line1, {
		fontFamily: "Source Sans Pro",
		fontSize: 12,
		top: HEAD_RADIUS*3.5,
		left: HEAD_RADIUS,
		originX: "center",
	});
	var gradeLine2 = new fabric.Text(gradeObj.line2, {
		fontFamily: "Source Sans Pro",
		fontSize: 12,
		top: HEAD_RADIUS*4,
		left: HEAD_RADIUS,
		originX: "center",
	});
	var token = new fabric.Group([head, shoulders, torso, base, nameplate, gradeLine1, gradeLine2], {
		left: x,
		top: y,
		fill: color,
		originX: "center",
		originY: "bottom",
		hasBorders: false,
		hasControls: false,
		index: tokenIndex,
	});
	gradeLine1.setColor("#ffffff");
	gradeLine2.setColor("#ffffff");
	if (gradeObj.line2Size == "large") {
		gradeLine2.setFontSize(36);
	}
	canvas.add(token);
	return token;
}

//var Twilight = drawNewToken(26, 200, "Twilight Sparkle", { line1: "Grade", line2: "1", line2Size: "large" }, 60, "#662D8A", "token1");
//var Pinkie = drawNewToken(150, 200, "Pinkie Pie", { line1: "Kinder-", line2: "garten", line2Size: "small" }, 40, "#ED458D", "token2");

canvas.on('object:modified', dropToken);

function dropToken(options){
	var draggedToken = options.target;
	if (draggedToken.index.indexOf("token") > -1) { // if this is a token
		var foundADock = false; // more predictable behavior if a token overlaps two platforms
		for (var i = 0; i < platformRegistry.platformCount; i++) {
			var platformIndex = "platform" + i;
			platformRegistry[platformIndex].residents.remove(draggedToken.index); // remove token from residence in each platform
			if (!foundADock && draggedToken.intersectsWithObject(platformRegistry[platformIndex].imageObject)) { // adapted from http://fabricjs.com/intersection/
				platformRegistry[platformIndex].imageObject.dock(draggedToken);
				foundADock = true;
			}
			else {
				distributeCrowd(platformRegistry[platformIndex].imageObject, platformRegistry[platformIndex].residents.list); // arrange tokens on the platform the token left
			}
		}
		draggedToken.setCoords();
		if (!foundADock && draggedToken.intersectsWithObject(orphanage)) {
			orphan(draggedToken.index);
			foundADock = true;
		}
	}
}

function eraseTokenImage(tokenImage) {
	canvas.remove(tokenImage);
}
;/* Token taxonomy:
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
