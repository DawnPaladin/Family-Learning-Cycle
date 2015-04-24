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

	image.dock = function(figurine) {
		console.log("Docking with " + image);
		figurine.left = image.getCenterPoint().x;
		figurine.top = image.getCenterPoint().y;
		figurine.setCoords();
	};
}

function addFigurine(x, y, height, color) {
	var head = new fabric.Circle({
		radius: HEAD_RADIUS,
	});
	var shoulders = new fabric.Circle({
		radius: HEAD_RADIUS,
		top: HEAD_RADIUS*2.5
	});
	var torso = new fabric.Rect({
		width: PERSON_WIDTH,
		height: height,
		top: HEAD_RADIUS*3.5
	});
	var base = new fabric.Circle({
		radius: HEAD_RADIUS,
		top: HEAD_RADIUS*2.5 + height
	});
	var figurine = new fabric.Group([head, shoulders, torso, base], {
		left: x + 0.5, // half-pixel offset to prevent fuzzy antialiasing
		top: y,
		fill: color,
		originX: "center",
		originY: "bottom",
		hasBorders: false,
		hasControls: false
	});
	canvas.add(figurine);
	return figurine;
}

var Twilight = addFigurine(26, 200, 60, "#662D8A");
var Pinkie = addFigurine(150, 200, 40, "#ED458D");

canvas.on('object:modified', dropFigurine);

function dropFigurine(options){
	var draggedFigurine = options.target;
	draggedFigurine.setCoords();
	for (var i = 0; i < boardSpaces.length; i++) {
		if (draggedFigurine.intersectsWithObject(boardSpaces[i])) { // adapted from http://fabricjs.com/intersection/
			boardSpaces[i].dock(draggedFigurine);
			return true;
		}
	}
}
