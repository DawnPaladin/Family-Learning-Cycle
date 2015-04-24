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

function drawNewToken(x, y, height, color) {
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
	var token = new fabric.Group([head, shoulders, torso, base], {
		left: x,
		top: y,
		fill: color,
		originX: "center",
		originY: "bottom",
		hasBorders: false,
		hasControls: false
	});
	canvas.add(token);
	return token;
}

var Twilight = drawNewToken(26, 200, 60, "#662D8A");
var Pinkie = drawNewToken(150, 200, 40, "#ED458D");

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
}
