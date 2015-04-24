var canvas = document.getElementById("FamilyLearningCycleToy");
var brush = canvas.getContext("2d");
//brush.fillRect(50,25,150,100);

function drawCircle(x, y, radius) {
	brush.beginPath();
	brush.arc(x, y, radius, 0, Math.PI*2, false);
	brush.closePath();
	brush.strokeStyle = "#000";
	brush.stroke();
}
function drawHalfCircle(x, y, radius, facingUp) {
	brush.beginPath();
	if (facingUp)
		brush.arc(x, y, radius, 0, Math.PI, false);
	else
		brush.arc(x, y, radius, Math.PI, 0, false);
	brush.strokeStyle = "#000";
	brush.stroke();
}
function drawPerson(x, y, height, lineColor) {
	var WIDTH = 50;
	var HEAD_RADIUS = WIDTH / 2;
	var shoulders = 	{ x: x, 						y: y+HEAD_RADIUS*2.5 			};
	shoulders.left = 	{ x: shoulders.x - HEAD_RADIUS, y: shoulders.y 					};
	shoulders.right = 	{ x: shoulders.x + HEAD_RADIUS, y: shoulders.y 					};
	var thighs = 		{ x: shoulders.x, 				y: shoulders.y + height 		};
	thighs.left = 		{ x: shoulders.left.x, 			y: shoulders.left.y + height 	};
	thighs.right =	 	{ x: shoulders.right.x, 		y: shoulders.right.y + height 	};
	brush.strokeStyle = lineColor;

	drawCircle(x, y, HEAD_RADIUS); // head
	drawHalfCircle(shoulders.x, shoulders.y, HEAD_RADIUS, false); // shoulders
	
	// left edge
	brush.moveTo(shoulders.left.x, shoulders.left.y);
	brush.lineTo(thighs.left.x, thighs.left.y);
	brush.stroke();

	// right edge
	brush.moveTo(shoulders.right.x, shoulders.right.y);
	brush.lineTo(thighs.right.x, thighs.right.y);
	brush.stroke();

	drawHalfCircle(thighs.x, thighs.y, HEAD_RADIUS, true); // groin
}

drawPerson(26, 25.5, 75, "#000");












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
