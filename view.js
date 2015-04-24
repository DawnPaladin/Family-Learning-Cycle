var canvas = new fabric.Canvas("FamilyLearningCycleToy");
var brush = canvas.getContext("2d");

var PERSON_WIDTH = 50;
var HEAD_RADIUS = PERSON_WIDTH / 2;
var debugging = false;

fabric.Image.fromURL('img/ECC.svg', setupPlatform, { left: 250, top: 100, selectable: false, });
fabric.Image.fromURL('img/CTG.svg', setupPlatform, { left: 500, top: 300, selectable: false, });
fabric.Image.fromURL('img/RTR.svg', setupPlatform, { left: 450, top: 500, selectable: false, });
fabric.Image.fromURL('img/EXP.svg', setupPlatform, { left: 100, top: 500, selectable: false, });
fabric.Image.fromURL('img/MOD.svg', setupPlatform, { left:  50, top: 300, selectable: false, });

var orphanage = new fabric.Rect({
	width: 972,
	height: 100,
	left: 0,
	top: 700,
	fill: "#F2F2F2",
	selectable: false,
});
canvas.add(orphanage);

function setupPlatform(image) {
	canvas.add(image); 
	canvas.sendToBack(image);
	platformRegistry.push(image);

	image.dock = function(token) {
		console.log("Docking with " + image);
		token.left = image.getCenterPoint().x;
		token.top = image.getCenterPoint().y;
		token.setCoords();
	};
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
	for (var i = 0; i < platformRegistry.length; i++) {
		if (draggedToken.intersectsWithObject(platformRegistry[i])) { // adapted from http://fabricjs.com/intersection/
			platformRegistry[i].dock(draggedToken);
			return true;
		}
	}
	if (draggedToken.intersectsWithObject(orphanage)) {
		orphan(draggedToken.index);
	}
}

function eraseToken(token) {
	canvas.remove(token);
}
