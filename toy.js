var canvas = new fabric.Canvas("FamilyLearningCycleToy");
var brush = canvas.getContext("2d");

var PERSON_WIDTH = 50;
var HEAD_RADIUS = PERSON_WIDTH / 2;
var debugging = false;

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
	var thighs = new fabric.Circle({
		radius: HEAD_RADIUS,
		top: HEAD_RADIUS*2.5 + height
	});
	var figurine = new fabric.Group([head, shoulders, torso, thighs], {
		left: x + 0.5, // half-pixel offset to prevent fuzzy antialiasing
		top: y,
		fill: color,
		hasBorders: false,
		hasControls: false
	});
	canvas.add(figurine);
}

addFigurine(26, 25, 60, "#C5B7DA");
addFigurine(150, 15, 40, "seagreen");
