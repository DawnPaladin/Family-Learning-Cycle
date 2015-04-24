var canvas = document.getElementById("FamilyLearningCycleToy");
var brush = canvas.getContext("2d");

function drawCircle(x, y, radius, color) {
	brush.beginPath();
	brush.arc(x, y, radius, 0, Math.PI*2, false);
	brush.closePath();
	brush.fillStyle = color;
	brush.fill();
}
function drawHalfCircle(x, y, radius, facingUp, color) {
	brush.beginPath();
	if (facingUp)
		brush.arc(x, y, radius, 0, Math.PI, false);
	else
		brush.arc(x, y, radius, Math.PI, 0, false);
	brush.fillStyle = color;
	brush.fill();
}
function drawPerson(x, y, height, color) {
	var WIDTH = 50;
	var HEAD_RADIUS = WIDTH / 2;
	var shoulders = 	{ x: x, 						y: y+HEAD_RADIUS*2.5 			};
	shoulders.left = 	{ x: shoulders.x - HEAD_RADIUS, y: shoulders.y 					};
	shoulders.right = 	{ x: shoulders.x + HEAD_RADIUS, y: shoulders.y 					};
	var thighs = 		{ x: shoulders.x, 				y: shoulders.y + height 		};
	thighs.left = 		{ x: shoulders.left.x, 			y: shoulders.left.y + height 	};
	thighs.right =	 	{ x: shoulders.right.x, 		y: shoulders.right.y + height 	};
	brush.fillStyle = color;

	drawCircle(x, y, HEAD_RADIUS, color); // head
	drawHalfCircle(shoulders.x, shoulders.y, HEAD_RADIUS, false, color); // shoulders
	brush.fillRect(shoulders.left.x, shoulders.left.y, WIDTH, height);
	drawHalfCircle(thighs.x, thighs.y, HEAD_RADIUS, true); // groin
}

drawPerson(26, 25.5, 60, "#C5B7DA");












/*function Draggable(x,y) {
	
	var self = this;
	self.x = x;
	self.y = y;
	self.gotoX = x;
	self.gotoY = y;

	var offsetX, offsetY;
	var pickupX, pickupY;
	// ...
}*/
