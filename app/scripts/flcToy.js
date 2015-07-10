/* jshint latedef: false */

var imgDir = '/images';

function toyFactory() {

	var flcToy = {
		model: {},
		view: {},
		controller: {}
	};

	// MODEL

	flcToy.model.tokenCount = 0;
	flcToy.model.platformCount = 0;
	flcToy.model.tokenRegistry = {};
	flcToy.model.platformRegistry = {};

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
		var This = this;
		this.coords = {x: x, y: y};
		this.name = name;
		this.url = url;
		this.location = flcToy.model.Locations[name];
		this.index = "platform" + flcToy.model.platformCount++;
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
			/*if (platformName === "Preschool") {
				console.log("Adding", tokenIndex, "to", platformName, "registry, which now reads:", residentsList);
			}*/
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
			//console.log("Removing", tokenIndex, "from", platformName, "registry, called by", arguments.callee.caller.toString());
			var arrayIndex = This.residents.find(tokenIndex);
			if (arrayIndex > -1) {
				residentsList.splice(arrayIndex, 1);
				/*if (platformName === "Preschool") {
					console.log("Removing", tokenIndex, "from", platformName, "registry, which now reads:", residentsList);
				}*/
			}
		};
		this.residents.erase = function() {
			residentsList = [];
		};
	};
	flcToy.model.overview = function() {
		var platforms = "Current page: " + story.currentPage + " Platform populations: "; /* jshint ignore:line */
		for (var i = 0; i < flcToy.model.platformCount - 1; i++) {
			var platformIndex = "platform" + i;
			platforms += flcToy.model.platformRegistry[platformIndex].residents.length() + " ";
		}
		platforms += "hospital: " + flcToy.model.platformRegistry.hospital.residents.length();
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

	flcToy.model.Locations = new List();
	flcToy.model.Locations.add(["Preschool", "Pre-K", "Kindergarten", "LGS", "ADV"], "Discover");
	flcToy.model.Locations.add(["ECC", "CTG", "RTR", "EXP", "MOD"], "Investigate", "circular");
	flcToy.model.Locations.add(["AHL", "WHL", "US1", "US2"], "Declare");
	flcToy.model.Locations.college = List.makeNode("college", "other");
	flcToy.model.Locations.orphanage = List.makeNode("orphanage", "other");
	flcToy.model.Locations.hospital = List.makeNode("hospital", "other");
	flcToy.model.Locations.staging = List.makeNode("staging", "other");
	flcToy.model.Locations.adrift = List.makeNode("adrift", "other");

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

	// VIEW

	flcToy.view.setup = function(canvasID, manual) {
		flcToy.view.canvas = new fabric.Canvas(canvasID);

		flcToy.view.canvas.selection = false;

		function disableScroll() {
			flcToy.view.canvas.allowTouchScrolling = false;
		}
		function enableScroll() {
			flcToy.view.canvas.allowTouchScrolling = true;
		}
		enableScroll();
		flcToy.view.canvas.on('object:moving', disableScroll);
		flcToy.view.canvas.on('mouse:up', enableScroll);

		// draw background

		var foyerHeight = manual ? 250 : 0; // also defined in flcToy.setup
		var DiscoverHeight = 320;
		var InvestigateHeight = 760;
		var DeclareHeight = 220;

		var CANVAS_WIDTH = 972;
		var CANVAS_HEIGHT = foyerHeight + DiscoverHeight + InvestigateHeight + DeclareHeight + 200;

		var tokenPreviewRect = new fabric.Rect({
			left: 0,
			top: 20,
			stroke: "silver",
			strokeWidth: 5,
			fill: "transparent",
			width: 225,
			height: 225,
			selectable: false,
		});
		var tokenPreviewText = new fabric.Text("Preview", {
			fontFamily: "Source Sans Pro",
			fontSize: 15,
			top: 0,
			left: 118,
			originX: "center",
			selectable: false,
		});
		fabric.Image.fromURL(
			imgDir+"/arrow.png", // path to image
			function(image) { // callback after loading image
				flcToy.view.canvas.add(image);
			},
			{ // options to pass to new image object
				left: 200,
				top: 80,
				selectable: false,
			}
		);

		flcToy.view.canvas.add(tokenPreviewRect, tokenPreviewText);

		var DiscoverRect = new fabric.Rect({
			left: 0,
			top: foyerHeight,
			fill: "#fef9f0",
			width: CANVAS_WIDTH,
			height: DiscoverHeight,
			selectable: false,
		});
		flcToy.view.canvas.add(DiscoverRect);

		fabric.Image.fromURL(
			imgDir+"/Discover.png", // path to image
			function(image) { // callback after loading image
				flcToy.view.canvas.add(image);
			},
			{ // options to pass to new image object
				left: 200,
				top: foyerHeight + 50,
				selectable: false,
			}
		);

		var InvestigateRect = new fabric.Rect({
			left: 0,
			top: foyerHeight + DiscoverHeight,
			fill: "#f4f8fa",
			width: CANVAS_WIDTH,
			height: InvestigateHeight,
			selectable: false,
		});
		flcToy.view.canvas.add(InvestigateRect);

		fabric.Image.fromURL(
			imgDir+"/FLC-circle.png", // path to image
			function(image) { // callback after loading image
				flcToy.view.canvas.add(image);
				image.sendToBack();
				image.bringForward(true);
			},
			{ // options to pass to new object
				left: 145,
				top: foyerHeight + DiscoverHeight + 120,
				selectable: false,
			}
		);

		fabric.Image.fromURL(
			imgDir+"/Investigate.png", // path to image
			function(image) { // callback after loading image
				flcToy.view.canvas.add(image);
			},
			{ // options to pass to new image object
				left: 125,
				top: foyerHeight + DiscoverHeight + 200,
				selectable: false,
			}
		);

		var DeclareRect = new fabric.Rect({
			left: 0,
			top: foyerHeight + DiscoverHeight + InvestigateHeight,
			fill: "#f2fae9",
			width: CANVAS_WIDTH,
			height: DeclareHeight,
			selectable: false,
		});
		flcToy.view.canvas.add(DeclareRect);

		fabric.Image.fromURL(
			imgDir+"/Declare.png", // path to image
			function(image) { // callback after loading image
				flcToy.view.canvas.add(image);
			},
			{ // options to pass to new image object
				left: 225,
				top: foyerHeight + DiscoverHeight + InvestigateHeight + 20,
				selectable: false,
			}
		);

		var PERSON_WIDTH = 50;
		var HEAD_RADIUS = PERSON_WIDTH / 2;
		var PLATFORM_ELBOW_ROOM = 20;

		function showOrphanage() {
			flcToy.view.orphanage.visible = true;
		}
		function hideOrphanage() {
			flcToy.view.orphanage.visible = false;
		}

		if (manual === true) {
			fabric.Image.fromURL(imgDir+'/trashcan.png', function(loadedImage) {
				flcToy.view.canvas.add(loadedImage);
				flcToy.view.orphanage = loadedImage;
			}, {
				selectable: false,
				left: 972 - 200 - 25,
				top: 25,
				hasControls: false,
				hasBorders: false,
				lockMovementX: true,
				lockMovementY: true,
				name: "orphanage",
			});
			flcToy.view.canvas.on("object:modified", flcToy.controller.tokenDragHandler);
			fabric.Image.fromURL(imgDir+'/cycle-btn.png', function(loadedImage) {
				flcToy.view.canvas.add(loadedImage);
			}, {
				selectable: true,
				left: 400,
				top: foyerHeight + DiscoverHeight + 350,
				hoverCursor: "pointer",
				hasControls: false,
				hasBorders: false,
				lockMovementX: true,
				lockMovementY: true,
				name: "cycle-btn",
			});
		}

		flcToy.view.setupPlatform = function(image, deferred) {
			flcToy.view.canvas.add(image);
			var platform = flcToy.controller.lookupPlatformByURL(image._element.src);

			image.dock = function(token) {
				//console.log("Docking " + token + " into " + image);
				token.top = image.getCenterPoint().y;
				platform.residents.add(token.index);
				flcToy.model.tokenRegistry[token.index].location = platform.location;
				flcToy.view.distributeCrowd(image, platform.residents.list());
				token.setCoords();
				flcToy.controller.refreshADV();
			};
			platform.imageObject = image;
			deferred.resolve("Platform is all set up");
		};

		flcToy.view.distributeCrowd = function(platformImage, residentsList) { // distribute crowd of tokens across the platform
			var crowdWidth = (residentsList.length - 1) * PERSON_WIDTH + (residentsList.length - 1) * PLATFORM_ELBOW_ROOM; // distance between first and last midpoints
			var crowdLeftEdge = -crowdWidth / 2;
			for (var i = 0; i < residentsList.length; i++) {
				var offsetFromCenter = crowdLeftEdge + (PERSON_WIDTH + PLATFORM_ELBOW_ROOM) * i;
				flcToy.model.tokenRegistry[residentsList[i]].canvasGroup.left = platformImage.getCenterPoint().x + offsetFromCenter;
				flcToy.model.tokenRegistry[residentsList[i]].canvasGroup.setCoords();
			}
		};

		flcToy.view.crowdDistribution = function(originImageObject, memberCount) {
			var crowdWidth = (memberCount - 1) * PERSON_WIDTH + (memberCount - 1) * PLATFORM_ELBOW_ROOM;
			var crowdLeftEdge = -crowdWidth / 2;
			var memberLocations = [];
			var y = originImageObject.getCenterPoint().y;
			for (var i = 0; i < memberCount; i++) {
				var offsetFromCenter = crowdLeftEdge + (PERSON_WIDTH + PLATFORM_ELBOW_ROOM) * i;
				var x = originImageObject.getCenterPoint().x + offsetFromCenter;
				memberLocations.push({left: x, top:y});
			}
			return memberLocations;
		};

		flcToy.view.drawNewToken = function(x, y, name, gradeObj, height, color, tokenIndex, lockMovement) {
			var head = new fabric.Circle({
				radius: HEAD_RADIUS,
				left: 0.5, // half-pixel offset to prevent fuzzy antialiasing
			});
			var shoulders = new fabric.Circle({
				radius: HEAD_RADIUS,
				top: HEAD_RADIUS*2.5,
				left: 0.5,
			});
			var torso = new fabric.Rect({
				width: PERSON_WIDTH,
				height: height,
				top: HEAD_RADIUS*3.5,
				left: 0.5,
			});
			var base = new fabric.Circle({
				radius: HEAD_RADIUS,
				top: HEAD_RADIUS*2.5 + height,
				left: 0.5,
			});
			var nameplate = new fabric.Text(name, {
				fontFamily: "Source Sans Pro",
				fontSize: 20,
				top: -28,
				left: HEAD_RADIUS,
				originX: "center",
			});
			var nameplatePadding = 5;
			var nameplateBG = new fabric.Rect({
				width: nameplate.width + nameplatePadding * 2,
				height: nameplate.height - nameplatePadding,
				top: -17,
				left: nameplate.left,
				originX: "center",
				originY: "center",
				opacity: 0.5
			});
			var gradeLine1 = new fabric.Text(gradeObj.line1, {
				fontFamily: "Source Sans Pro",
				fontSize: 12,
				top: HEAD_RADIUS*3.5,
				left: HEAD_RADIUS,
				originX: "center",
			});
			var gradeLine2 = new fabric.Text(gradeObj.line2, {
				fontFamily: "Source Sans Pro",
				fontSize: 12,
				top: HEAD_RADIUS*4,
				left: HEAD_RADIUS,
				originX: "center",
			});
			var token = new fabric.Group([head, shoulders, torso, base, nameplateBG, nameplate, gradeLine1, gradeLine2], {
				left: x,
				top: y,
				fill: color,
				originX: "center",
				originY: "bottom",
				hasBorders: false,
				hasControls: false,
				lockMovementX: lockMovement,
				lockMovementY: lockMovement,
				hoverCursor: lockMovement ? "default" : "move",
				index: tokenIndex,
			});
			token.base = base;
			nameplateBG.setColor("#ffffff");
			gradeLine1.setColor("#ffffff");
			gradeLine2.setColor("#ffffff");
			if (gradeObj.line2Size === "large") {
				gradeLine2.setFontSize(36);
			}
			token.itemInGroupIntersectsWithObject = function(other) {
				function aContainsB(rectA, rectB) {
					// sample rect: [thisCoords.tl, thisCoords.tr, thisCoords.br, thisCoords.bl]
					//logRound( rectA[0].x, rectB[0].x, rectB[1].x, rectA[1].x, between(rectA[0].x, rectB[0].x, rectB[1].x, rectA[1].x));
					//logRound( rectA[3].x, rectB[3].x, rectB[2].x, rectA[2].x, between(rectA[3].x, rectB[3].x, rectB[2].x, rectA[2].x));
					//logRound( rectA[0].y, rectB[0].y, rectB[3].y, rectA[3].y, between(rectA[0].y, rectB[0].y, rectB[3].y, rectA[3].y));
					//logRound( rectA[1].y, rectB[1].y, rectB[2].y, rectA[2].y, between(rectA[1].y, rectB[1].y, rectB[2].y, rectA[2].y));
					return (
						between(rectA[0].x, rectB[0].x, rectB[1].x, rectA[1].x) && // rectA.tl < rectB.tl < rectB.tr < rectA.tr
						between(rectA[3].x, rectB[3].x, rectB[2].x, rectA[2].x) && // rectA.bl < rectB.bl < rectB.bl < rectA.br
						between(rectA[0].y, rectB[0].y, rectB[3].y, rectA[3].y) && // rectA.tl < rectB.tl < rectB.tr < rectA.tr
						between(rectA[1].y, rectB[1].y, rectB[2].y, rectA[2].y)    // rectA.bl < rectB.bl < rectB.bl < rectA.br
						);
				}
				/*function logRound() {
					var args = Array.prototype.slice.call(arguments);
					var output = "";
					args.forEach(function(x){
						output += Math.round(x) + " ";
					});
					console.log(output);
				}*/
				function between(a, b, c, d) {
					return (a <= b && b <= c && c <= d);
				}
				function getCoords(oCoords) {
					return {
						tl: new fabric.Point(oCoords.tl.x, oCoords.tl.y),
						tr: new fabric.Point(oCoords.tr.x, oCoords.tr.y),
						bl: new fabric.Point(oCoords.bl.x, oCoords.bl.y),
						br: new fabric.Point(oCoords.br.x, oCoords.br.y)
					};
				}
				function getBaseCoords(oCoords, base) {
					var height = oCoords.bl.y - oCoords.tl.y;
					var baseHeightOffset =  height - base.getPointByOrigin("center", "top").y;
					return {
						tl: new fabric.Point(oCoords.tl.x, oCoords.tl.y + baseHeightOffset),
						tr: new fabric.Point(oCoords.tr.x, oCoords.tr.y + baseHeightOffset),
						bl: new fabric.Point(oCoords.bl.x, oCoords.bl.y),
						br: new fabric.Point(oCoords.br.x, oCoords.br.y)
					};
				}
				var thisCoords = getBaseCoords(this.oCoords, token.base),
				//var thisCoords = getCoords(this.oCoords),
					otherCoords = getCoords(other.oCoords),
					intersection = fabric.Intersection.intersectPolygonPolygon(
						[thisCoords.tl, thisCoords.tr, thisCoords.br, thisCoords.bl],
						[otherCoords.tl, otherCoords.tr, otherCoords.br, otherCoords.bl]
					);
				var platformRect = new fabric.Polygon(
					[otherCoords.tl, otherCoords.tr, otherCoords.br, otherCoords.bl],
					{fill: "blue"}
					);
				var tokenBaseRect = new fabric.Polygon(
					[thisCoords.tl, thisCoords.tr, thisCoords.br, thisCoords.bl],
					{fill: "red"}
				);

				var intersects = intersection.status === 'Intersection';
				var contains = aContainsB(platformRect.points, tokenBaseRect.points);
				//tokenBaseRect.setColor(intersects || contains) ? "green" : "red");
				//flcToy.view.canvas.add(tokenBaseRect, platformRect);
				//console.log(intersection.status, contains);

				return intersects || contains;
			};
			flcToy.view.canvas.add(token);
			return token;
		};

		flcToy.view.dropToken = function(options){
			var draggedToken = options.target;
			var tokenIndex = draggedToken.index;
			if (tokenIndex.indexOf("token") > -1) { // if this is a token
				var foundADock = false; // more predictable behavior if a token overlaps two platforms
				flcToy.model.tokenRegistry[tokenIndex].location = flcToy.model.Locations.adrift;
				for (var i = 0; i < flcToy.model.platformCount; i++) {
					var platformIndex = "platform" + i;
					flcToy.model.platformRegistry[platformIndex].residents.remove(tokenIndex); // remove token from residence in each platform
					if (!foundADock && draggedToken.itemInGroupIntersectsWithObject(flcToy.model.platformRegistry[platformIndex].imageObject)) { // adapted from http://fabricjs.com/intersection/
						flcToy.model.platformRegistry[platformIndex].imageObject.dock(draggedToken);
						foundADock = true;
					} else {
						flcToy.view.distributeCrowd(flcToy.model.platformRegistry[platformIndex].imageObject, flcToy.model.platformRegistry[platformIndex].residents.list()); // arrange tokens on the platform the token left
					}
				}
				draggedToken.setCoords();
				flcToy.controller.refreshADV();
				if (!foundADock && draggedToken.intersectsWithObject(flcToy.view.orphanage)) {
					flcToy.controller.orphan(tokenIndex);
					foundADock = true;
				}
			}
		};

		flcToy.view.canvas.on('object:modified', flcToy.view.dropToken);
		flcToy.view.canvas.on('mouse:down', function(options){
			if (typeof options.target === 'object' && options.target.name === 'cycle-btn') {
				flcToy.controller.advanceCycle();
			}
			//flcToy.view.ripple(options.e.offsetX, options.e.offsetY);
		});

		flcToy.view.eraseTokenImage = function(tokenImage) {
			flcToy.view.canvas.remove(tokenImage);
		};

		flcToy.view.ripple = function(x, y, color) {
			// var fill = new fabric.Circle({
			// 	top: y,
			// 	left: x,
			// 	radius: 1,
			// 	fill: color,
			// 	opacity: 0.3,
			// 	originX: "center",
			// 	originY: "center",
			// });
			// flcToy.view.canvas.add(fill);
			// fill.animate({radius: CANVAS_HEIGHT, opacity: 0}, {
			// 	duration: 1000,
			// 	onChange: flcToy.view.canvas.renderAll.bind(flcToy.view.canvas),
			// 	onComplete: function(){ flcToy.view.canvas.remove(fill); }
			// });
			var stroke = new fabric.Circle({
				top: y,
				left: x,
				radius: 1,
				fill: "transparent",
				stroke: color,
				strokeWidth: 5,
				opacity: 0.8,
				originX: "center",
				originY: "center",
			});
			flcToy.view.canvas.add(stroke);
			stroke.animate({radius: CANVAS_HEIGHT}, {
				duration: 1000,
				onChange: flcToy.view.canvas.renderAll.bind(flcToy.view.canvas),
				onComplete: function(){ flcToy.view.canvas.remove(stroke); }
			});
		};

		flcToy.view.bridgeOut = {
			setup: function() {
				var platformCoords = flcToy.controller.lookupPlatformCenter(flcToy.model.platformRegistry.ADV);
				var This = this;
				fabric.Image.fromURL(
					imgDir+'/do-not-enter.png', // path to image
					function(image){ flcToy.view.canvas.add(image); flcToy.view.bridgeOut.image = image; }, // callback after loading image
					{ // options to pass to new image object
						left: platformCoords.x,
						top: platformCoords.y + 0.5 - 8,
						originX: "center",
						originY: "center",
						width: 30,
						height: 30,
						selectable: false,
						opacity: 0,
					}
				);
			},
			show: function() {
				flcToy.view.bridgeOut.image.opacity = 1;
				flcToy.view.canvas.renderAll();
			},
			hide: function() {
				flcToy.view.bridgeOut.image.opacity = 0;
				flcToy.view.canvas.renderAll();
			}
		};

	}; // end view setup function

	// STORY

	flcToy.story = {
		library: {
			Robert: [
				{
					text: "Let's imagine a family with one child named Robert. Robert's parents start him out in Preschool.",
					tokens: [
						{ //format: string name, string gradeIndex, int height (20-70), string color
							name: "Robert",
							init: ["Robert", "0", 50, "#dd5b5a", true],
							platform: "hospital"
						}
					]
				},
				{ text: "Over the next few years, Robert advances from pre-K...", advance: true},
				{ text: "...to Kindergarten...", advance: true },
				{ text: "...then 1st grade...", advance: true },
				{ text: "...then 2nd grade. Now Robert is done with the Discover section, so next year he'll move to the Investigate section and begin the Family Learning Cycle, where he'll stay for the rest of middle school.", advance: true },
				{ text: "<i>Exploring Countries and Cultures</i> (ECC) gives Robert an overview of the whole planet. He'll see the physical and spiritual needs of mankind while learning about ecosystems and lifestyles in different parts of the world. Robert will return to ECC to study it in more detail once he's finished the rest of the Family Learning Cycle.", advance: true },
				{ text: "With <i>Creation to the Greeks</i>, Robert begins a four-year chronological study of history. This year is dedicated to an overview of the Old Testament, which serves as a key history text and allows students to study the Bible and ancient history side by side.", advance: true },
				{ text: "<i>Rome to the Reformation</i> provides perspective on the New Testament by showing what life was like under the Romans. We follow the development of the church and study the Middle Ages, culminating with the Renaissance and Reformation.", advance: true },
				{ text: "In <i>Exploration to 1850</i>, our third year of chronological history, we explore the New World with Leif Ericsson, Christopher Columbus, and many others. We study the history of America from colonial times to the California gold rush, learn about the courage and faith of many who came to America, and see how U.S. and world history are interrelated.", advance: true },
				{ text: "<i>1850 to Modern Times</i> rounds out our study of chronological history by studying states and capitals, reciting the Gettysburg Address, solving cryptography puzzles, and baking Vietnamese Apricot Coconut Cake, among other things.", advance: true },
				{ text: "In 8th grade, Robert returns to <i>Exploring Countries and Cultures</i> to study it in greater depth than was possible in 3rd grade.", advance: true },
				{ text: "In 9th grade, Robert exits the Family Learning Cycle and begins high school.", advance: true },
				{ text: "(Keep advancing Robert through high school.)", advance: true },
				{ text: "(Keep advancing Robert through high school.)", advance: true },
				{ text: "(Keep advancing Robert through high school.)", advance: true },
				{ text: "Robert graduates from high school and is ready to begin a career or leave for college.", advance: true }
			],
			Carpenters: [
				{
					text: "Daniel is starting preschool at the same time Molly is transferring in from 2nd grade in a public school.",
					tokens: [
						{ //format: string name, string gradeIndex, int height (20-70), string color
							name: "Daniel",
							init: ["Daniel", "0", 55, "#ffa544", true],
							platform: "hospital"
						}, {
							name: "Molly",
							init: ["Molly", "4", 70, "#f9b5d1", true],
							platform: "platform4"
						}
					],
					triggerFunc: function() { flcToy.view.bridgeOut.setup(); }
				}, {
					text: "At the end of the year, Molly advances to <i>Exploring Countries and Cultures</i> while Daniel moves into Pre-K.",
					advance: true
				}, {
					text: "The Carpenter family is blessed with two more children, one after another: Matthew and Alicia.",
					advance: true,
					tokens: [
						{
							name: "Matthew",
							init: ["Matthew", "0", 45, "#5377a6", true],
							platform: "hospital"
						}
					],
					triggerFunc: function() { flcToy.view.bridgeOut.hide(); }
				}, {
					text: "<i>Adventures in US History</i> is only used for students who don't have older siblings in the Family Learning Cycle. When Daniel finishes first grade, instead of doing <i>Adventures</i>, he joins Molly in the Family Learning Cycle. Mrs. Carpenter will teach <i>Exploration to 1850</i> to both children, giving each child material appropriate for their age level as spelled out in the Teacher's Manual.",
					advance: true,
					tokens: [
						{
							name: "Alicia",
							init: ["Alicia", "0", 35, "#b66de2", true],
							platform: "hospital"
						}
					],
					triggerFunc: function() {
						var adv = flcToy.model.platformRegistry.ADV;
						var platformCoords = flcToy.controller.lookupPlatformCenter(adv);
						flcToy.view.ripple(platformCoords.x, platformCoords.y, "#a00d1f");
						flcToy.view.bridgeOut.show();
					}
				}, {
					text: "As each child finishes the Discover section, they join the rest of the family in the Family Learning Cycle, whatever year they happen to be on.",
					advance: true,
					triggerFunc: function() { flcToy.view.bridgeOut.hide(); }
				}, {
					text: "As each child finishes the Discover section, they join the rest of the family in the Family Learning Cycle, whatever year they happen to be on.",
					advance: true
				}, {
					text: "As each child finishes the Discover section, they join the rest of the family in the Family Learning Cycle, whatever year they happen to be on.",
					advance: true
				}, {
					text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
					advance: true
				}, {
					text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
					advance: true
				}, {
					text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
					advance: true
				}, {
					text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
					advance: true
				}, {
					text: "Molly graduates from high school just as Daniel enters it.",
					advance: true
				}, {
					text: "Molly graduates from high school just as Daniel enters it.",
					advance: true
				}, {
					text: "Matthew and Amanda each enter High School as they hit 9th grade.",
					advance: true
				}, {
					text: "Matthew and Amanda each enter High School as they hit 9th grade.",
					advance: true
				}, {
					text: "Matthew and Amanda each enter High School as they hit 9th grade.",
					advance: true
				}, {
					text: "Matthew and Amanda each enter High School as they hit 9th grade.",
					advance: true
				}, {
					text: "Matthew and Amanda each enter High School as they hit 9th grade.",
					advance: true
				}, {
					text: "Having successfully educated four children preschool through 12th grade, Mrs. Carpenter retires to a beach in Hawaii.",
					advance: true
				}
			]
		},
		box: null,
		pages: null,
		currentPage: -1,
		maxProgress: -1,
		tokenRegistry: {},
		historyDepth: 0,
		turnPageForward: function(){
			var currentPage = flcToy.story.pages[++flcToy.story.currentPage];
			if (flcToy.story.currentPage > flcToy.story.maxProgress) { // if we are turning a page for the first time
				flcToy.story.maxProgress = flcToy.story.currentPage;

				flcToy.story.box.html(currentPage.text);

				if (currentPage.advance || false) {
					flcToy.controller.advanceCycle();
				}
				// if page has associated tokens, create them
				if (Array.isArray(currentPage.tokens) || false) {
					for (var i = 0; i < currentPage.tokens.length; i++) {
						var currentToken = currentPage.tokens[i];
						var tokenIndex = flcToy.controller.newToken.apply(null, currentToken.init);
						flcToy.story.tokenRegistry[currentToken.name] = tokenIndex;
						var tokenData = flcToy.model.tokenRegistry[tokenIndex];
						var platformData = flcToy.model.platformRegistry[currentToken.platform];
						flcToy.controller.moveTokenToPlatform(tokenData, platformData);
						if (platformData.name === "hospital") { // animate tokens from Hospital to Preschool platform
							flcToy.controller.assignTokenToPlatform(tokenData, flcToy.model.platformRegistry.Preschool);
							flcToy.controller.forgeBirthCertificate(tokenIndex, tokenData);
						}
					}
					currentPage.tokens = undefined; // remove tokens from page to prevent them from being re-created if/when we return to this page
													// now that we're using maxProgress, this is probably unnecessary
					flcToy.controller.updateAllTokenLocations();
				}
				if (currentPage.triggerFunc) {
					currentPage.triggerFunc();
				}
			} else { // advancing, but not for the first time
				flcToy.story.box.html(currentPage.text);

				if (currentPage.advance || false) {
					flcToy.controller.unReverseCycle();
				}

				flcToy.controller.updateAllTokenLocations();

				if (currentPage.triggerFunc) {
					currentPage.triggerFunc();
				}
			}

			// enable/disable forward/back controls as appropriate
			if (flcToy.story.currentPage > 0) {
				flcToy.story.prevBtn.prop("disabled", false);
			}
			if (flcToy.story.currentPage === flcToy.story.pages.length - 1) {
				flcToy.story.nextBtn.prop("disabled", true);
			}

			flcToy.controller.verifyTokenData();
		},
		turnPageBackward: function(){
			var oldPage = flcToy.story.pages[flcToy.story.currentPage];
			var currentPage = flcToy.story.pages[--flcToy.story.currentPage];
			flcToy.story.box.html(currentPage.text);
			if (oldPage.advance || false) {
				flcToy.controller.reverseCycle();
			}
			if (currentPage.triggerFunc) {
				currentPage.triggerFunc();
			}

			// if we're on the first page of the story, disable the Back button
			if (flcToy.story.currentPage < 1) {
				flcToy.story.prevBtn.prop("disabled", true);
			}
			if (flcToy.story.currentPage < flcToy.story.pages.length) {
				flcToy.story.nextBtn.prop("disabled", false);
			}
			flcToy.controller.verifyTokenData();
		},
	};

	// CONTROLLER

	/* Token taxonomy:
		flcToy.model.tokenRegistry: Collection of tokenData stored in model.js
		tokenData: Found in flcToy.model.tokenRegistry. Stores a tokenImage in tokenData.canvasGroup.
		tokenIndex: Name of tokenData in flcToy.model.tokenRegistry. flcToy.model.tokenRegistry[tokenIndex] = tokenData
		tokenImage: Canvas/fabric object. Stores a tokenIndex in tokenImage.index so you can get back to tokenData.
		tokenRoster: Array of tokenIndexes.
		tokenFormation: Array of tokenData. musterTokens(tokenRoster) = tokenFormation
		tokenList is ambiguous. Don't use it.
	*/

	/* === creation and destruction === */
	flcToy.controller.tokenPreview = {
		tokenIndex: null,
		spawnCoordsX: 117.5,
		spawnCoordsY: 240,
	};
	flcToy.controller.tokenPreview.new = function(options) {
		var name = options.nameField.val();
		var grade = options.gradeSelect.val();
		var height = Number(options.heightSlider.val());
		var color = jQuery('input[name = "' + options.colorBoxes + '"]:checked').val();
		var tokenIndex = flcToy.controller.newToken(name, grade, height, color);
		flcToy.controller.tokenPreview.tokenIndex = tokenIndex;
		console.log("Created preview token", tokenIndex);
	};
	flcToy.controller.tokenPreview.update = function(tokenIndex, options) {
		var tokenImage = flcToy.model.tokenRegistry[tokenIndex].canvasGroup;
		flcToy.view.eraseTokenImage(tokenImage);
		var name = options.nameField.val();
		var grade = flcToy.model.processGrade(options.gradeSelect.val());
		var height = Number(options.heightSlider.val());
		var color = jQuery('input[name = "' + options.colorBoxes + '"]:checked').val();
		var x = flcToy.controller.tokenPreview.spawnCoordsX;
		var y = flcToy.controller.tokenPreview.spawnCoordsY;
		flcToy.model.tokenRegistry[tokenIndex].canvasGroup = flcToy.view.drawNewToken(x, y, name, grade, height, color, tokenIndex, false);
	};
	flcToy.controller.tokenPreview.changeHandler = function(options) {
		if (flcToy.controller.tokenPreview.tokenIndex === null) {
			flcToy.controller.tokenPreview.new(options);
		} else {
			flcToy.controller.tokenPreview.update(flcToy.controller.tokenPreview.tokenIndex, options);
		}
	};
	flcToy.controller.tokenPreview.updateHandler = function(options) {
		var name = options.nameField.val();
		var grade = options.gradeSelect.val();
		var height = Number(options.heightSlider.val());
		var color = jQuery('input[name = "' + options.colorBoxes + '"]:checked').val();
		var tokenIndex = flcToy.controller.newToken(name, grade, height, color);
		var tokenData = flcToy.model.tokenRegistry[tokenIndex];
		var platformData = flcToy.controller.lookupPlatformByGradeIndex(grade);
		var platformCoords = flcToy.controller.lookupPlatformCenter(platformData);
		options.nameField.val("");
		options.gradeSelect.val("0");
		options.heightSlider.val(45);
		document.querySelector('input[name = "' + options.colorBoxes + '"]:checked').checked = false;
		document.querySelector('input[value = "#dd5b5a"]').checked = true;
	};
	flcToy.controller.newToken = function (name, gradeIndex, height, color, lockMovement) {
		var gradeObj = flcToy.model.processGrade(gradeIndex);
		var tokenIndex = 'token' + flcToy.model.tokenCount++;
		var tokenData = new flcToy.model.Token(name, gradeObj, height, color, lockMovement);
		flcToy.model.tokenRegistry[tokenIndex] = tokenData;
		flcToy.model.tokenRegistry[tokenIndex].canvasGroup = flcToy.view.drawNewToken(flcToy.controller.tokenPreview.spawnCoordsX, flcToy.controller.tokenPreview.spawnCoordsY, name, gradeObj, height, color, tokenIndex, lockMovement);
		return tokenIndex;
	}; //newToken('Twilight Sparkle', '1', 50, '#662D8A');
	flcToy.controller.orphan = function(tokenIndex) {
		console.assert((typeof tokenIndex === "string"), "This is not a tokenIndex:", tokenIndex);
		console.log('Removing ' + tokenIndex);
		flcToy.view.eraseTokenImage(flcToy.model.tokenRegistry[tokenIndex].canvasGroup);
		flcToy.model.tokenRegistry[tokenIndex] = { orphaned: true };
	};
	flcToy.controller.hospitalize = function(tokenIndex) {
		console.assert((typeof tokenIndex === "string"), "This is not a tokenIndex:", tokenIndex);
		flcToy.controller.walkTokensToPlatform([tokenIndex], flcToy.model.platformRegistry.hospital, false, true);
	};
	flcToy.controller.forEachToken = function(func) { // call thusly: flcToy.controller.forEachToken(function(tokenIndex, tokenData){ ... });
		for (var i = 0; i < flcToy.model.tokenCount; i++) {
			var tokenIndex = "token" + i;
			if (typeof flcToy.model.tokenRegistry[tokenIndex] === "object") {
				if (typeof flcToy.model.tokenRegistry[tokenIndex].orphaned === "boolean" && flcToy.model.tokenRegistry[tokenIndex].orphaned === true) {
					//console.log("Skipping orphaned token");
				} else {
					func(tokenIndex, flcToy.model.tokenRegistry[tokenIndex]);
				}
			}
		}
	};
	flcToy.controller.newPlatform = function(x, y, name, url) {
		var deferred = jQuery.Deferred();
		var thePlatform = new flcToy.model.Platform(x, y, name, url);
		var platformIndex = thePlatform.index;
		flcToy.model.platformRegistry[platformIndex] = thePlatform;	// register platform by serial number...
		flcToy.model.platformRegistry[name] = thePlatform; 			// ... and by name
		fabric.Image.fromURL(
			flcToy.model.platformRegistry[platformIndex].url, // path to image
			function(image){ flcToy.view.setupPlatform(image, deferred); }, // callback after loading image
			{ // options to pass to new image object
				left: flcToy.model.platformRegistry[platformIndex].coords.x,
				top: flcToy.model.platformRegistry[platformIndex].coords.y,
				selectable: false,
			}
		);
		flcToy.model.Locations[name].platformIndex = platformIndex;
		return deferred.promise();
	};

	/* === utility === */
	flcToy.controller.lookupCanvasObjectByURL = function(url) {
		for (var i = 0; i < flcToy.view.canvas._objects.length; i++) {
			try {
				if (flcToy.view.canvas._objects[i]._element.src.indexOf(url) > 0) {
					return flcToy.view.canvas._objects[i];
				}
			}
			catch (error) {
				//console.error(error);
			}
		}
	};
	flcToy.controller.lookupPlatformByURL = function(url) {
		for (var i = 0; i < flcToy.model.platformCount; i++) {
			var platformIndex = 'platform' + i;
			var platformURL = flcToy.model.platformRegistry[platformIndex].url;
			var endOfPlatformURL = platformURL.substr(platformURL.length - 7);
			var endOfURL = url.substr(url.length - 7);
			if (endOfPlatformURL.indexOf(endOfURL) > -1) {
				return flcToy.model.platformRegistry[platformIndex];
			}
		}
	};
	flcToy.controller.lookupPlatformCenter = function(platformData) {
		var platformCenter = {
			x: platformData.imageObject.oCoords.mt.x,
			y: platformData.imageObject.oCoords.ml.y
		};
		return platformCenter;
	};
	flcToy.controller.lookupPlatformByGradeIndex = function(gradeIndex) {
		gradeIndex = Number(gradeIndex);
		var platformIndex = "platform";
		if (gradeIndex < 4) { // Discover
			platformIndex += gradeIndex; // place according to grade
		} else if (gradeIndex === 4) {
			if (flcToy.model.platformRegistry.ADV.disabled) {
				platformIndex = flcToy.cycleYear.platformIndex; // place in FLC
			} else {
				platformIndex += gradeIndex; // place according to grade
			}
		} else if (gradeIndex > 4 && gradeIndex < 10){ // Investigate
			platformIndex = flcToy.cycleYear.platformIndex; // place in FLC
		} else if (gradeIndex >= 10) { // Declare
			platformIndex += (gradeIndex - 1); // as of ECC, gradeIndex and tokenIndex no longer match up, because if you're an only child you do ECC twice
		} else {
			console.error("Invalid gradeIndex:", gradeIndex);
		}
		var platformData = flcToy.model.platformRegistry[platformIndex];
		return platformData;
	};

	flcToy.controller.musterTokens = function(tokenRoster) { // convert an array of token names to an array of tokens
		console.assert(Array.isArray(tokenRoster), "This is not a tokenRoster:", tokenRoster);
		var formation = [];
		for (var i = 0; i < tokenRoster.length; i++) {
			formation.push(flcToy.model.tokenRegistry[tokenRoster[i]]);
		}
		return formation;
	};

	flcToy.controller.deregisterTokenFromAllPlatforms = function(tokenData, redistribute) {
		console.assert((typeof tokenData === "object" && typeof tokenData.name === "string"), "This is not a tokenData:", tokenData);
		for (var i = 0; i < flcToy.model.platformCount; i++) { // remove token from all previous platforms
			var platformIndex = 'platform' + i;
			flcToy.model.platformRegistry[platformIndex].residents.remove(tokenData.canvasGroup.index); // remove token from residence in each platform
			if (redistribute) {
				flcToy.view.distributeCrowd(flcToy.model.platformRegistry[platformIndex].imageObject, flcToy.model.platformRegistry[platformIndex].residents.list());
			}
		}
	};

	flcToy.controller.clearResidentsFromPlatforms = function() {
		for (var i = 0; i < flcToy.model.platformCount; i++) {
			var platformIndex = 'platform' + i;
			flcToy.model.platformRegistry[platformIndex].residents.erase();
		}
	};

	flcToy.controller.tokensInFLC = function() {
		var foundFLCPlatform = false;
		flcToy.controller.forEachToken(function(tokenIndex, tokenData){
			if (tokenData.location.section === "Investigate") {
				foundFLCPlatform = true;
			}
		});
		return foundFLCPlatform;
	};
	function clone(obj) { // from http://stackoverflow.com/a/728694/1805453
	    var copy;

	    // Handle the 3 simple types, and null or undefined
	    if (null === obj || "object" !== typeof obj) {
	    	return obj;
	    }

	    // Handle Date
	    if (obj instanceof Date) {
	        copy = new Date();
	        copy.setTime(obj.getTime());
	        return copy;
	    }

	    // Handle Array
	    if (obj instanceof Array) {
	        copy = [];
	        for (var i = 0, len = obj.length; i < len; i++) {
	            copy[i] = clone(obj[i]);
	        }
	        return copy;
	    }

	    // Handle Object
	    if (obj instanceof Object) {
	        copy = {};
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr)) {
	            	if (attr === "location") {
	            		var locationName = obj.location.name;
	            		copy.location = flcToy.model.Locations[locationName];
	            	} else if (attr === "canvasGroup" || attr === "imageObject") {
	            		// don't copy these recursively
	            		copy[attr] = obj[attr];
	            	} else {
	            		copy[attr] = clone(obj[attr]);
	            	}
	            }
	        }
	        return copy;
	    }

	    throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	/* === movement === */
	flcToy.controller.moveTokenToPlatform = function(tokenData, platformData) {
		console.assert((typeof tokenData === "object" && typeof tokenData.name === "string"), "This is not a tokenData:", tokenData);
		console.assert((typeof platformData === "object" && typeof platformData.imageObject === "object" && typeof platformData.name === "string"), "This is not a platformData:", platformData);
		//deregisterTokenFromAllPlatforms(tokenData, true);
		platformData.imageObject.dock(tokenData.canvasGroup);
		flcToy.view.canvas.renderAll();
	};
	flcToy.controller.moveTokensToPlatform = function(tokenFormation, platformData, increment) {
		console.assert((typeof platformData === "object" && typeof platformData.imageObject === "object" && typeof platformData.name === "string"), "This is not a platformData:", platformData);
		for (var i = 0; i < tokenFormation.length; i++) {
			flcToy.controller.moveTokenToPlatform(tokenFormation[i], platformData);
			if (increment) {
				flcToy.controller.incrementTokenGrade(tokenFormation[i].canvasGroup);
			}
		}
	};
	flcToy.controller.walkToken = function(tokenData, coords) {
		console.assert((typeof tokenData === "object" && typeof tokenData.name === "string"), "This is not a tokenData:", tokenData);
		//console.log('Walk ', tokenData, ' to ', coords);
		tokenData.canvasGroup.animate(coords, {
			duration: 750,
			easing: fabric.util.ease.easeInOutCubic,
			onChange: flcToy.view.canvas.renderAll.bind(flcToy.view.canvas),
		});
	};
	flcToy.controller.walkTokensToPlatform = function(tokenRoster, platformData, incrementGrade, updateRosters) {
		console.assert(Array.isArray(tokenRoster), "This is not a tokenRoster:", tokenRoster);
		console.assert((typeof platformData === "object" && typeof platformData.imageObject === "object" && typeof platformData.name === "string"), "This is not a platformData:", platformData);
		var formation = flcToy.view.crowdDistribution(platformData.imageObject, tokenRoster.length);
		var tokenFormation = flcToy.controller.musterTokens(tokenRoster);
		for (var i = 0; i < tokenRoster.length; i++) {
			flcToy.controller.walkToken(tokenFormation[i], formation[i]);
			if (incrementGrade) {
				flcToy.controller.incrementTokenGrade(tokenFormation[i].canvasGroup);
			}
			if (updateRosters) {
				flcToy.controller.assignTokenToPlatform(tokenFormation[i], platformData);
			}
			tokenFormation[i].canvasGroup.setCoords();
		}
	};
	flcToy.controller.assignTokenToPlatform = function(tokenData, platformData) {
		console.assert((typeof tokenData === "object" && typeof tokenData.name === "string"), "This is not a tokenData:", tokenData);
		console.assert((typeof platformData === "object" && typeof platformData.name === "string"), "This is not a platformData:", platformData);
		//console.log(tokenData, platformData);
		// update platform information about tokens
		flcToy.controller.deregisterTokenFromAllPlatforms(tokenData, false);
		platformData.residents.add(tokenData.canvasGroup.index);
		// update token information about platforms
		tokenData.location = platformData.location;
	};
	flcToy.controller.verifyTokenData = function(log) {
		flcToy.controller.forEachToken(function(tokenIndex, tokenData) {
			var platformIndex = tokenData.location.platformIndex;
			var platformResidents = flcToy.model.platformRegistry[platformIndex].residents.list();
			if (log) { console.log(tokenIndex, "platform:", platformIndex, "; residents:", platformResidents); }
			console.assert(platformResidents.indexOf(tokenIndex) > -1, platformIndex + " rejects " + tokenIndex + "'s claim of residence.");
		});
	};
	flcToy.controller.updateAllTokenLocations = function() {
		for (var j = 0; j < flcToy.model.platformCount; j++) {
			var platformIndex = 'platform' + j;
			var platformName = flcToy.model.platformRegistry[platformIndex].name;
			var roster = [];
			flcToy.controller.forEachToken(function(tokenIndex, tokenData){ // https://jslinterrors.com/dont-make-functions-within-a-loop
				if (tokenData.location.name === platformName) {
					roster.push(tokenIndex);
				}
			}); // jshint ignore:line
			flcToy.controller.walkTokensToPlatform(roster, flcToy.model.platformRegistry[platformIndex], false, true);
		}
	};

	flcToy.controller.tokenDragHandler = function(options) {
		flcToy.controller.tokenPreview.tokenIndex = null;
	};

	flcToy.controller.incrementTokenGrade = function(tokenImage) {
		console.assert((typeof tokenImage === "object" && typeof tokenImage.canvas === "object" && typeof tokenImage.fill === "string"), "This is not a tokenImage:", tokenImage);
		var tokenIndex = tokenImage.index;
		var oldGradeIndex = Number(flcToy.model.tokenRegistry[tokenIndex].grade.index);
		var newGradeIndex = oldGradeIndex + 1;
		if (newGradeIndex > 15) {
			newGradeIndex = 15;
		}
		flcToy.model.tokenRegistry[tokenIndex].grade = flcToy.model.processGrade(newGradeIndex);
		flcToy.controller.updateTokenGrade(tokenIndex);
	};

	flcToy.controller.decrementTokenGrade = function(tokenImage) {
		console.assert((typeof tokenImage === "object" && typeof tokenImage.canvas === "object" && typeof tokenImage.fill === "string"), "This is not a tokenImage:", tokenImage);
		var tokenIndex = tokenImage.index;
		var oldGradeIndex = Number(flcToy.model.tokenRegistry[tokenIndex].grade.index);
		var newGradeIndex = oldGradeIndex - 1;
		if (newGradeIndex < 0) {
			newGradeIndex = 0;
		}
		flcToy.model.tokenRegistry[tokenIndex].grade = flcToy.model.processGrade(newGradeIndex);
		flcToy.controller.updateTokenGrade(tokenIndex);
	};

	flcToy.controller.updateTokenGrade = function(tokenIndex) {
		console.assert((typeof tokenIndex === "string"), "This is not a tokenIndex:", tokenIndex);
		var tokenImage = flcToy.model.tokenRegistry[tokenIndex].canvasGroup;
		var gradeObj = flcToy.model.tokenRegistry[tokenIndex].grade;
		tokenImage._objects[6].text = gradeObj.line1;
		tokenImage._objects[7].text = gradeObj.line2;
		if (gradeObj.line2Size === 'large') {
			tokenImage._objects[7].fontSize = 36;
		}
		else {
			tokenImage._objects[7].fontSize = 12;
		}
		flcToy.view.canvas.renderAll();
	};

	flcToy.controller.disablePlatform = function(platform) {
		console.assert((typeof platform === "object" && typeof platform.imageObject === "object" && typeof platform.name === "string"), "This is not a platformData:", platform);
		platform.disabled = true;
		platform.imageObject.opacity = 0.5;
		flcToy.view.canvas.renderAll();
	};
	flcToy.controller.enablePlatform = function(platform) {
		console.assert((typeof platform === "object" && typeof platform.imageObject === "object" && typeof platform.name === "string"), "This is not a platformData:", platform);
		platform.disabled = false;
		platform.imageObject.opacity = 1;
		flcToy.view.canvas.renderAll();
	};

	/* === initialization === */

	flcToy.cycleYear = flcToy.model.Locations.ECC;
	flcToy.cycleYearHistory = [flcToy.cycleYear.name];

	flcToy.setup = function(options) {
		var manual = options.story === "manual";
		flcToy.view.setup(options.canvas, manual);

		var platformPromises = [];

		var DiscoverBaseX = 90;
		var DiscoverBaseY = manual ? 450 : 200; // foyer height also defined in flcToy.view.setup
		platformPromises.push(flcToy.controller.newPlatform(DiscoverBaseX +  0, DiscoverBaseY +  0, 'Preschool', imgDir+'/Preschool.png'));
		platformPromises.push(flcToy.controller.newPlatform(DiscoverBaseX + 150, DiscoverBaseY + 50, 'Pre-K', imgDir+'/Pre-K.png'));
		platformPromises.push(flcToy.controller.newPlatform(DiscoverBaseX + 300, DiscoverBaseY +  0, 'Kindergarten', imgDir+'/Kindergarten.png'));
		platformPromises.push(flcToy.controller.newPlatform(DiscoverBaseX + 450, DiscoverBaseY + 50, 'LGS', imgDir+'/LGS.png'));
		platformPromises.push(flcToy.controller.newPlatform(DiscoverBaseX + 600, DiscoverBaseY +  0, 'ADV', imgDir+'/USH.png')); // 'ADV.png' gets hit by AdBlock

		var InvestigateBase = DiscoverBaseY + 240;
		platformPromises.push(flcToy.controller.newPlatform(325, InvestigateBase +   0, 'ECC', imgDir+'/ECC.png'));
		platformPromises.push(flcToy.controller.newPlatform(600, InvestigateBase + 250, 'CTG', imgDir+'/CTG.png'));
		platformPromises.push(flcToy.controller.newPlatform(550, InvestigateBase + 500, 'RTR', imgDir+'/RTR.png'));
		platformPromises.push(flcToy.controller.newPlatform(100, InvestigateBase + 500, 'EXP', imgDir+'/EXP.png'));
		platformPromises.push(flcToy.controller.newPlatform( 50, InvestigateBase + 250, 'MOD', imgDir+'/MOD.png'));

		var DeclareBase = InvestigateBase + 780;
		platformPromises.push(flcToy.controller.newPlatform( 50, DeclareBase +  0, 'AHL', imgDir+'/AHL.png'));
		platformPromises.push(flcToy.controller.newPlatform(275, DeclareBase + 25, 'WHL', imgDir+'/WHL.png'));
		platformPromises.push(flcToy.controller.newPlatform(500, DeclareBase +  0, 'US1', imgDir+'/US1.png'));
		platformPromises.push(flcToy.controller.newPlatform(725, DeclareBase + 25, 'US2', imgDir+'/US2.png'));

		platformPromises.push(flcToy.controller.newPlatform( 25, DeclareBase + 105, 'college', imgDir+'/college.png'));
		platformPromises.push(flcToy.controller.newPlatform(DiscoverBaseX - 500, DiscoverBaseY, 'hospital', imgDir+'/hospital.png'));

		if (manual) {
			platformPromises.push(flcToy.controller.newPlatform( 450, 180, 'staging', imgDir+'/staging.png'));
		}

		jQuery.when.apply(jQuery, platformPromises).then(function(){ // when all promises in platformPromises are fulfilled (see http://stackoverflow.com/a/5627301/1805453)
			if (options.story === "manual") {
				options.controls.on('input change', function(){ flcToy.controller.tokenPreview.changeHandler(options); });
			} else {
				options.nextBtn.click(flcToy.story.turnPageForward);
				options.prevBtn.click(flcToy.story.turnPageBackward);
				var storyName = options.story;
				flcToy.story.pages = flcToy.story.library[storyName];
				flcToy.story.box = options.textField;
				flcToy.story.nextBtn = options.nextBtn;
				flcToy.story.prevBtn = options.prevBtn;
				flcToy.story.turnPageForward();
			}
		});
	};

	flcToy.controller.advanceCycleYear = function() {
		if (flcToy.controller.tokensInFLC()) {
			flcToy.cycleYear = flcToy.cycleYear.next;
		} else {
			flcToy.cycleYear = flcToy.model.Locations.ECC;
		}
	};
	flcToy.controller.refreshADV = function() {
		// enable/disable ADV depending on whether the FLC is active
		if (flcToy.controller.tokensInFLC()) {
			flcToy.controller.disablePlatform(flcToy.model.platformRegistry.platform4);
		} else {
			flcToy.controller.enablePlatform(flcToy.model.platformRegistry.platform4);
		}
	};

	flcToy.controller.forgeBirthCertificate = function(tokenIndex, tokenData) {
		if (typeof flcToy.model.tokenRegistry.prev === "object") { // if the board has a previous state
			flcToy.model.tokenRegistry.prev[tokenIndex] = clone(tokenData);
			flcToy.model.tokenRegistry.prev[tokenIndex].location = flcToy.model.Locations.hospital;
			flcToy.model.platformRegistry.prev.hospital.residents.add(tokenIndex);
		}
	};

	flcToy.controller.advanceCycle = function() {

		// save current state to history
		flcToy.model.tokenRegistry.prev = clone(flcToy.model.tokenRegistry);
		flcToy.model.platformRegistry.prev = clone(flcToy.model.platformRegistry);
		flcToy.cycleYearHistory.push(flcToy.cycleYear.name);

		flcToy.controller.forEachToken(function(tokenIndex, tokenData) {
			flcToy.controller.incrementTokenGrade(flcToy.model.tokenRegistry[tokenIndex].canvasGroup);
			if (flcToy.model.tokenRegistry[tokenIndex].grade.index === 11) { // move 9th graders out of FLC
				flcToy.model.tokenRegistry[tokenIndex].location = flcToy.model.Locations.AHL;
			}
		});

		flcToy.controller.advanceCycleYear();
		flcToy.controller.refreshADV();

		// determine changed token locations
		flcToy.controller.forEachToken(function(tokenIndex, tokenData) {
			var tokenLocation = flcToy.model.tokenRegistry[tokenIndex].location;
			if (tokenLocation.section === 'Discover') {
				if ((tokenLocation.name === 'ADV') || (tokenLocation.name === 'LGS' && flcToy.controller.tokensInFLC())) {
					flcToy.model.tokenRegistry[tokenIndex].location = flcToy.cycleYear;
				}
				else {
					//console.log(tokenRegistryCopy.token0.location.name);
					flcToy.model.tokenRegistry[tokenIndex].location = tokenLocation.next;
					//console.log(tokenRegistryCopy.token0.location.name);
				}
			}
			if (tokenLocation.section === 'Investigate') {
				flcToy.model.tokenRegistry[tokenIndex].location = flcToy.cycleYear;
			}
			if (tokenLocation.section === 'Declare') {
				if (flcToy.model.tokenRegistry[tokenIndex].grade.index === 11) { // just-arrived 9th graders
					// stay put, you've moved already
				} else if (tokenLocation.name === 'US2') {
					flcToy.model.tokenRegistry[tokenIndex].location = flcToy.model.Locations.college;
				} else {
					flcToy.model.tokenRegistry[tokenIndex].location = tokenLocation.next;
				}
			}
		});

		// special case handling: A token enters ADV when the FLC was just activated
		if (flcToy.controller.tokensInFLC() && flcToy.model.platformRegistry.platform4.residents.length() > 0) {
			for (var l = 0; l < flcToy.model.platformRegistry.platform4.residents.length(); l++) {
				flcToy.controller.assignTokenToPlatform(
					flcToy.model.tokenRegistry[flcToy.model.platformRegistry.platform4.residents.list(l)], // tokenData
					flcToy.model.platformRegistry[flcToy.cycleYear.platformIndex] // platformData
				);
			}
			flcToy.controller.disablePlatform(flcToy.model.platformRegistry.platform4);
		}

		// move tokens to their new locations
		flcToy.controller.updateAllTokenLocations();
	};

	flcToy.controller.reverseCycle = function() {

		// restore previous state from history
		try {
			// save current state to futureHistory
			var tokenFutureHistory = clone(flcToy.model.tokenRegistry);
			var platformFutureHistory = clone(flcToy.model.platformRegistry);

			flcToy.model.tokenRegistry = flcToy.model.tokenRegistry.prev;
			flcToy.model.platformRegistry = flcToy.model.platformRegistry.prev;
			flcToy.cycleYear = flcToy.model.Locations[flcToy.cycleYearHistory[flcToy.story.currentPage]];

	 		flcToy.model.tokenRegistry.next = tokenFutureHistory;
	 		flcToy.model.platformRegistry.next = platformFutureHistory;
		} catch (error) {
			console.warn("Cannot restore board state from history.", error);
		}

		flcToy.controller.forEachToken(function(tokenIndex, tokenData){
			flcToy.controller.updateTokenGrade(tokenIndex);
		});
		flcToy.controller.updateAllTokenLocations();

	};

	flcToy.controller.unReverseCycle = function() {
		// restore previous state from history
		try {
			flcToy.model.tokenRegistry = flcToy.model.tokenRegistry.next;
			flcToy.model.platformRegistry = flcToy.model.platformRegistry.next;
			flcToy.cycleYear = flcToy.model.Locations[flcToy.cycleYearHistory[flcToy.story.currentPage]];
		} catch (error) {
			console.warn("Cannot restore board state from future-history.", error);
		}

		flcToy.controller.forEachToken(function(tokenIndex, tokenData){
			flcToy.controller.updateTokenGrade(tokenIndex);
		});
		flcToy.controller.updateAllTokenLocations();
	};

	function christmasGhosts(tokenIndex) {
		var past = "null", present = "null", future = "null";
		try { past = flcToy.model.tokenRegistry.prev[tokenIndex].location.name; } catch (e) {}
		try { present = flcToy.model.tokenRegistry[tokenIndex].location.name; } catch (e) {}
		try { future = flcToy.model.tokenRegistry.next[tokenIndex].location.name; } catch (e) {}
		console.log(past, present, future);
	}

	return flcToy;
}

var RobertOptions = {
	canvas: "Robert-toy",
	story: "Robert",
	nextBtn: jQuery('#Robert-toy-wrapper .storyNextBtn'),
	prevBtn: jQuery('#Robert-toy-wrapper .storyPrevBtn'),
	textField: jQuery('#Robert-toy-wrapper .storyText'),
};

var CarpenterOptions = {
	canvas: "Carpenter-toy",
	story: "Carpenters",
	nextBtn: jQuery('#Carpenter-toy-wrapper .storyNextBtn'),
	prevBtn: jQuery('#Carpenter-toy-wrapper .storyPrevBtn'),
	textField: jQuery('#Carpenter-toy-wrapper .storyText'),
};

var manualOptions = {
	canvas: "sandbox-toy",
	story: "manual",
	controls: jQuery('#sandbox-toy-wrapper .toyControls'),
	nameField: jQuery('#nameField'),
	gradeSelect: jQuery('#gradeSelect'),
	heightSlider: jQuery('#heightSlider'),
	colorBoxes: "chooseColor",
};

//jQuery(function(){
	var toy1 = toyFactory();
	toy1.setup(RobertOptions);
	var toy2 = toyFactory();
	toy2.setup(CarpenterOptions);
	var toy3 = toyFactory();
	toy3.setup(manualOptions);
//});
