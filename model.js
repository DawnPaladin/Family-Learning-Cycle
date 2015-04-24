var tokenRegistry = { tokenCount: 0 };
var platformRegistry = { platformCount: 0 };

function Token(name, grade, height, color) { // class definition
	this.name = name;
	this.grade = grade;
	this.height = height;
	this.color = color;
	this.location = {x: 0, y: 0};
}

function Platform(x, y, name, url) {
	this.location = {x: x, y: y};
	this.name = name;
	this.url = url;
	this.index = "platform" + platformRegistry.platformCount++;
	this.residents = { list: [] };
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
