var canvas = document.getElementById("FamilyLearningCycleToy");
var brush = canvas.getContext("2d");

var PERSON_WIDTH = 50;
var HEAD_RADIUS = PERSON_WIDTH / 2;
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
	self.bounding = {
		set: function() {
			self.bounding.minX = self.x - HEAD_RADIUS;
			self.bounding.minY = self.y - HEAD_RADIUS;
			self.bounding.maxX = self.x + HEAD_RADIUS;
			self.bounding.maxY = self.y + HEAD_RADIUS * 2.5 + height;
			self.bounding.width = HEAD_RADIUS * 2;
			self.bounding.height = HEAD_RADIUS * 4.5 + height;
		}
	};
	self.bounding.set();
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
		self.draw(self.x, self.y);
		self.bounding.set();
	};

}

var Bobby = new Draggable(50.5, 75.5, 60, "#C5B7DA");

window.addEventListener("mousemove", function(event) {
	if (Mouse.pressed) {
		//showHitbox();
		var XonTargetA = Mouse.x >= Bobby.bounding.minX;
		var XonTargetB = Mouse.x <= Bobby.bounding.maxX; 
		var YonTargetA = Mouse.y >= Bobby.bounding.minY;
		var YonTargetB = Mouse.y <= Bobby.bounding.maxY;
		console.log(Mouse.x, Mouse.y, Bobby.bounding, XonTargetA, XonTargetB, YonTargetA, YonTargetB);
		if (XonTargetA && XonTargetB && YonTargetA && YonTargetB) {
			// drag handling
			Bobby.drag(Mouse.x+0.5,Mouse.y+0.5);
		}
	}
});

document.getElementById("showHitboxBtn").addEventListener("click", showHitbox);
function showHitbox(){
	drawCircle(Bobby.x, Bobby.y, 3, "rgba(0,0,0,.5)");
	brush.fillRect(Bobby.bounding.minX, Bobby.bounding.minY, Bobby.bounding.width, Bobby.bounding.height);
}
