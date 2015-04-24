var tokenRegistry = { tokenCount: 0 };
var platformRegistry = [];

function Token(name, grade, height, color) { // class definition
	this.name = name;
	this.grade = grade;
	this.height = height;
	this.color = color;
	this.location = {x: 0, y: 0};
}
