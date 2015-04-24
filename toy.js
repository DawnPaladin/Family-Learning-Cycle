var canvas = new fabric.Canvas("FamilyLearningCycleToy");
var brush = canvas.getContext("2d");

var PERSON_WIDTH = 50;
var HEAD_RADIUS = PERSON_WIDTH / 2;
var debugging = false;

var boardSpaces = [];

fabric.Image.fromURL('img/ECC.svg', setupBoardSpace, { left: 250, top: 100, selectable: false, });
fabric.Image.fromURL('img/CTG.svg', setupBoardSpace, { left: 500, top: 300, selectable: false, });
fabric.Image.fromURL('img/RTR.svg', setupBoardSpace, { left: 450, top: 500, selectable: false, });
fabric.Image.fromURL('img/EXP.svg', setupBoardSpace, { left: 100, top: 500, selectable: false, });
fabric.Image.fromURL('img/MOD.svg', setupBoardSpace, { left:  50, top: 300, selectable: false, });

function setupBoardSpace(image) {
	canvas.add(image); 
	canvas.sendToBack(image);
	boardSpaces.push(image);

	image.dock = function(token) {
		console.log("Docking with " + image);
		token.left = image.getCenterPoint().x;
		token.top = image.getCenterPoint().y;
		token.setCoords();
	};
}

function addToken(x, y, height, color) {
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

var Twilight = addToken(26, 200, 60, "#662D8A");
var Pinkie = addToken(150, 200, 40, "#ED458D");

canvas.on('object:modified', dropToken);

function dropToken(options){
	var draggedToken = options.target;
	draggedToken.setCoords();
	for (var i = 0; i < boardSpaces.length; i++) {
		if (draggedToken.intersectsWithObject(boardSpaces[i])) { // adapted from http://fabricjs.com/intersection/
			boardSpaces[i].dock(draggedToken);
			return true;
		}
	}
}
