var canvas = new fabric.Canvas("FamilyLearningCycleToy");
var brush = canvas.getContext("2d");

var PERSON_WIDTH = 50;
var HEAD_RADIUS = PERSON_WIDTH / 2;
var debugging = false;

var orphanage = new fabric.Rect({
	width: 972,
	height: 100,
	left: 0,
	top: 900,
	fill: "#F2F2F2",
	selectable: false,
});
canvas.add(orphanage);

function setupPlatform(image) {
	canvas.add(image); 
	canvas.sendToBack(image);
	var platform = lookupPlatformByURL(image._element.src);
	image.dock = function(token) {
		token.left = image.getCenterPoint().x;
		token.top = image.getCenterPoint().y;
		token.setCoords();
		platform.residents.add(token.index);
	};
	platform.imageObject = image;
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
	draggedToken.setCoords();
	for (var i = 0; i < platformRegistry.platformCount; i++) {
		var platformIndex = "platform" + i;
		if (draggedToken.intersectsWithObject(platformRegistry[platformIndex].imageObject)) { // adapted from http://fabricjs.com/intersection/
			platformRegistry[platformIndex].imageObject.dock(draggedToken);
			return true;
		}
		else
			platformRegistry[platformIndex].residents.remove(draggedToken.index); // remove token from residence in each platform it's not docked to
	}
	if (draggedToken.intersectsWithObject(orphanage)) {
		orphan(draggedToken.index);
		return true;
	}
}

function eraseToken(token) {
	canvas.remove(token);
}
