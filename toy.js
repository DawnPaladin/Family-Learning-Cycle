var canvas = document.getElementById("FamilyLearningCycleToy");
var brush = canvas.getContext("2d");

var PERSON_WIDTH = 50;
var debugging = false;

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
	var HEAD_RADIUS = PERSON_WIDTH / 2;
	var shoulders = 	{ x: x, 						y: y+HEAD_RADIUS*2.5 			};
	shoulders.left = 	{ x: shoulders.x - HEAD_RADIUS, y: shoulders.y 					};
	shoulders.right = 	{ x: shoulders.x + HEAD_RADIUS, y: shoulders.y 					};
	var thighs = 		{ x: shoulders.x, 				y: shoulders.y + height 		};
	thighs.left = 		{ x: shoulders.left.x, 			y: shoulders.left.y + height 	};
	thighs.right =	 	{ x: shoulders.right.x, 		y: shoulders.right.y + height 	};
	brush.fillStyle = color;

	drawCircle(x, y, HEAD_RADIUS, color); // head
	drawHalfCircle(shoulders.x, shoulders.y, HEAD_RADIUS, false, color); // shoulders
	brush.fillRect(shoulders.left.x, shoulders.left.y, PERSON_WIDTH, height);
	drawHalfCircle(thighs.x, thighs.y, HEAD_RADIUS, true); // groin
}

//drawPerson(26, 25.5, 60, "#C5B7DA");

function Draggable(originalX, originalY, height, color) {
	
	var self = this;
	self.x = originalX;
	self.y = originalY;
	//self.gotoX = x;
	//self.gotoY = y;

	var offsetX, offsetY;
	var pickupX, pickupY;

	self.draw = function(newX, newY) {
		brush.clearRect(0,0,canvas.width,canvas.height);
		//brush.save();
		//brush.translate(self.x, self.y);
		drawPerson(newX, newY, height, color);
		//brush.restore();
	};
	self.draw(self.x, self.y);

	self.drag = function(newX, newY) {
		self.x = newX;
		self.y = newY;
		self.draw(newX, newY);
	};

}

var Bobby = new Draggable(76, 75.5, 60, "#C5B7DA");

window.addEventListener("mousemove", function(event) {
	var deltaX = Math.abs(Mouse.x - Bobby.x);
	var deltaY = Math.abs(Mouse.y - Bobby.y);
	if (deltaX < PERSON_WIDTH && deltaY < PERSON_WIDTH && Mouse.pressed) {
		// drag handling
		Bobby.drag(Mouse.x+0.5,Mouse.y+0.5);
	}
});
