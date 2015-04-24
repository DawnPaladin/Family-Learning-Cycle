var tokenRegistry = { tokenCount: 0 };
var platformRegistry = { platformCount: 0 };

function Token(name, grade, height, color) { // class definition
	this.name = name;
	this.grade = grade;
	this.height = height;
	this.color = color;
	this.location = {x: 0, y: 0};
	this.canvasGroup = null;
}

function Platform(x, y, name, url) {
	this.location = {x: x, y: y};
	this.name = name;
	this.url = url;
	this.index = "platform" + platformRegistry.platformCount++;
	this.residents = { list: [] };
	this.imageObject = null;
	var residentRegistry = this.residents;
	residentRegistry.add = function(tokenIndex) {
		residentRegistry.list.push(tokenIndex);
	};
	residentRegistry.find = function(tokenIndex) {
		for (var i = 0; i < residentRegistry.list.length; i++) {
			if (residentRegistry.list[i].indexOf(tokenIndex) > -1)
				return i;
		}
		return -1;
	};
	residentRegistry.remove = function(tokenIndex) {
		var arrayIndex = residentRegistry.find(tokenIndex);
		if (arrayIndex > -1)
			residentRegistry.list.splice(arrayIndex, 1);
	};
}

function cyclicCounter(initial, maximum) {
	this.counter = initial;
	this.maximum = maximum;
	this.increment = function(){
		if (++this.counter > maximum)
			this.counter = 0;
		return this.counter;
	};
}

function processGrade(gradeIndex) {
	// process value from Grade dropdown
	var gradeLevels = ["Preschool", "Pre-K", "Kindergarten", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
	var gradeText = gradeLevels[gradeIndex];
	var gradeObj = { 
		index: gradeIndex, 
		line2Size: "large" 
	};
	switch (gradeText) {
		case "Preschool":
			gradeObj.line1 = "Pre-";
			gradeObj.line2 = "school";
			gradeObj.line2Size = "small";
			break;
		case "Pre-K":
			gradeObj.line1 = "Pre-";
			gradeObj.line2 = "K";
			break;
		case "Kindergarten":
			gradeObj.line1 = "Kinder-";
			gradeObj.line2 = "garten";
			gradeObj.line2Size = "small";
			break;
		default:
			gradeObj.line1 = "Grade";
			gradeObj.line2 = gradeText;
			break;
	}
	return gradeObj;
}
