var flcToy = {
	model: {},
	view: {},
	controller: {},
};

flcToy.model.tokenRegistry = { tokenCount: 0 };
flcToy.model.platformRegistry = { platformCount: 0 };

flcToy.model.Token = function(name, grade, height, color) { // class definition
	this.name = name;
	this.grade = grade;
	this.height = height;
	this.color = color;
	this.coords = {x: 0, y: 0};
	this.canvasGroup = null;
	this.location = null;
};

flcToy.model.Platform = function(x, y, name, url) {
	this.coords = {x: x, y: y};
	this.name = name;
	this.url = url;
	this.location = flcToy.model.Locations[name];
	this.index = "platform" + flcToy.model.platformRegistry.platformCount++;
	this.imageObject = null;
	this.disabled = false;
	var platformName = this.name;
	var residentsList = [];
	this.residents = {};
	var ThisResidents = this.residents;
	this.residents.list = function(index) {
		if (typeof index !== "undefined") {
			return residentsList[index];
		} else {
			return residentsList;
		}
	};
	this.residents.length = 0;
	this.residents.add = function(tokenIndex) {
		if (residentsList.indexOf(tokenIndex) > -1) {
			console.warn(tokenIndex, "is already in", platformName, "residents list.");
		} else {
			residentsList.push(tokenIndex);
		}
		if (platformName === "Preschool") {
			console.log("Adding", tokenIndex, "to", platformName, "registry, which now reads:", residentsList);
		}
		ThisResidents.length = residentsList.length;
	};
	this.residents.find = function(tokenIndex) {
		for (var i = 0; i < ThisResidents.length; i++) {
			if (residentsList[i].indexOf(tokenIndex) > -1) {
				return i;
			}
		}
		return -1;
	};
	this.residents.remove = function(tokenIndex) {
		//console.log("Removing", tokenIndex, "from", platformName, "registry, called by", arguments.callee.caller.toString());
		var arrayIndex = ThisResidents.find(tokenIndex);
		if (arrayIndex > -1) {
			residentsList.splice(arrayIndex, 1);
			ThisResidents.length = residentsList.length;
			if (platformName === "Preschool") {
				console.log("Removing", tokenIndex, "from", platformName, "registry, which now reads:", residentsList);
			}
		}
	};
	this.residents.erase = function() {
		residentsList = [];
	};
};

var List = function(){
	List.makeNode = function(name, sectionName) {
		return {
			name: name,
			section: sectionName,
			next: null,
			platformIndex: null,
		};
	};
	this.add = function(array, sectionName, listType) {
		for (var i = 0; i < array.length; i++) {
			this[array[i]] = List.makeNode(array[i], sectionName);
		}
		for (var j = 0; j < array.length; j++) {
			this[array[j]].next = this[array[j+1]];
		}
		this.first = this[array[0]];
		this.last = this[array[array.length - 1]];
		if (listType === "circular") {
			this.last.next = this.first;
		}
	};
};

flcToy.model.Locations = new List();
flcToy.model.Locations.add(["Preschool", "Pre-K", "Kindergarten", "LGS", "ADV"], "Discover");
flcToy.model.Locations.add(["ECC", "CTG", "RTR", "EXP", "MOD"], "Investigate", "circular");
flcToy.model.Locations.add(["AHL", "WHL", "US1", "US2"], "Declare");
flcToy.model.Locations.college = List.makeNode("college", "other");
flcToy.model.Locations.orphanage = List.makeNode("orphanage", "other");
flcToy.model.Locations.hospital = List.makeNode("hospital", "other");

flcToy.model.CyclicCounter = function(initial, minimum, maximum) {
	this.counter = initial;
	this.minimum = minimum;
	this.maximum = maximum;
	if (this.initial > this.maximum || this.initial < this.minimum) {
		this.counter = this.minimum;
	}
	this.increment = function(){
		if (++this.counter > maximum) {
			this.counter = this.minimum;
		}
		return this.counter;
	};
};
flcToy.model.LinearCounter = function(initial) {
	this.counter = initial;
	this.increment = function() {
		return ++this.counter;
	};
};

flcToy.model.processGrade = function(gradeIndex) {
	// process value from Grade dropdown
	var gradeLevels = ["Preschool", "Pre-K", "Kindergarten", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", ""];
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
		case "":
			gradeObj.line1 = "Grad";
			gradeObj.line2 = " ";
			break;
		default:
			gradeObj.line1 = "Grade";
			gradeObj.line2 = gradeText;
			break;
	}
	return gradeObj;
};
