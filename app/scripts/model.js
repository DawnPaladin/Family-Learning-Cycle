function flcModelFactory() {
	var model = {};

	model.tokenCount = 0;
	model.platformCount = 0;
	model.tokenRegistry = {};
	model.platformRegistry = {};

	model.Token = function(name, grade, height, color) { // class definition
		this.name = name;
		this.grade = grade;
		this.height = height;
		this.color = color;
		this.coords = {x: 0, y: 0};
		this.canvasGroup = null;
		this.location = null;
	};

	model.Platform = function(x, y, name, url) {
		var This = this;
		this.coords = {x: x, y: y};
		this.name = name;
		this.url = url;
		this.location = model.Locations[name];
		this.index = "platform" + model.platformCount++;
		this.imageObject = null;
		this.disabled = false;
		var platformName = this.name;
		var residentsList = [];
		this.residents = {};
		this.residents.list = function(index) {
			if (typeof index !== "undefined") {
				return residentsList[index].slice();
			} else {
				return residentsList.slice(); // slice: return a copy instead of the original (by value instead of by reference)
			}
		};
		this.residents.length = function() { return residentsList.length; };
		this.residents.add = function(tokenIndex) {
			if (residentsList.indexOf(tokenIndex) > -1) {
				console.warn(tokenIndex, "is already in", platformName, "residents list.");
			} else {
				residentsList.push(tokenIndex);
			}
		};
		this.residents.find = function(tokenIndex) {
			for (var i = 0; i < residentsList.length; i++) {
				if (residentsList[i].indexOf(tokenIndex) > -1) {
					return i;
				}
			}
			return -1;
		};
		this.residents.remove = function(tokenIndex) {
			var arrayIndex = This.residents.find(tokenIndex);
			if (arrayIndex > -1) {
				residentsList.splice(arrayIndex, 1);
			}
		};
		this.residents.erase = function() {
			residentsList = [];
		};
	};
	model.overview = function() {
		var platforms = "Current page: " + story.currentPage + " Platform populations: "; /* jshint ignore:line */
		for (var i = 0; i < model.platformCount - 1; i++) {
			var platformIndex = "platform" + i;
			platforms += model.platformRegistry[platformIndex].residents.length() + " ";
		}
		platforms += "hospital: " + model.platformRegistry.hospital.residents.length();
		console.log(platforms);
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

	model.Locations = new List();
	model.Locations.add(["Preschool", "Pre-K", "Kindergarten", "LGS", "ADV"], "Discover");
	model.Locations.add(["ECC", "CTG", "RTR", "EXP", "MOD"], "Investigate", "circular");
	model.Locations.add(["AHL", "WHL", "US1", "US2"], "Declare");
	model.Locations.college = List.makeNode("college", "other");
	model.Locations.orphanage = List.makeNode("orphanage", "other");
	model.Locations.hospital = List.makeNode("hospital", "other");
	model.Locations.staging = List.makeNode("staging", "other");
	model.Locations.adrift = List.makeNode("adrift", "other");

	model.cycleYear = model.Locations.ECC;
	model.cycleYearHistory = [model.cycleYear.name];

	model.CyclicCounter = function(initial, minimum, maximum) {
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
	model.LinearCounter = function(initial) {
		this.counter = initial;
		this.increment = function() {
			return ++this.counter;
		};
	};

	model.processGrade = function(gradeIndex) {
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

	model.forEachToken = function(func) { // call thusly: model.forEachToken(function(tokenIndex, tokenData){ ... });
		for (var i = 0; i < model.tokenCount; i++) {
			var tokenIndex = "token" + i;
			if (typeof model.tokenRegistry[tokenIndex] === "object") {
				if (typeof model.tokenRegistry[tokenIndex].orphaned === "boolean" && model.tokenRegistry[tokenIndex].orphaned === true) {
					//console.log("Skipping orphaned token");
				} else {
					func(tokenIndex, model.tokenRegistry[tokenIndex]);
				}
			}
		}
	};

	model.checkForFLCMultiOccupancy = function() {
		var platformsWithTokens = [];
		model.forEachToken(function(tokenIndex, tokenData){
			if (tokenData.location && tokenData.location.section === "Investigate" && platformsWithTokens.indexOf(tokenData.location.name) === -1) { // if token has a location not on the list
				platformsWithTokens.push(tokenData.location.name);
			}
		});
		return platformsWithTokens.length > 1;
	};
	model.calculateCycleYear = function() {
		// Assumes that only one of the Investigate platforms has tokens on it. This should only be run after model.checkForFLCMultiOccupancy().
		var cycleYear = null;
		model.forEachToken(function(tokenIndex, tokenData){
			if (tokenData.location && tokenData.location.section === "Investigate") { // if token has a location not on the list
				cycleYear = tokenData.location;
			}
		});
		if (!cycleYear) { cycleYear = model.Locations.ECC; }
		return cycleYear;
	};

	return model;
}
