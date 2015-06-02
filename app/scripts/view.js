(function(){

	flcToy.view.canvas = new fabric.Canvas('FamilyLearningCycleToy');

	flcToy.view.canvas.selection = false;

	var CANVAS_WIDTH = 972;
	var CANVAS_HEIGHT = 1800;

	(function(){ // draw background

		var DiscoverHeight = 320;
		var InvestigateHeight = 820;
		var DeclareHeight = 320;

		var DiscoverRect = new fabric.Rect({
			left: 0,
			top: 0,
			fill: "#fffcfa",
			width: CANVAS_WIDTH,
			height: DiscoverHeight,
			selectable: false,
		});
		flcToy.view.canvas.add(DiscoverRect);

		fabric.Image.fromURL(
			"images/Discover.png", // path to image
			function(image) { // callback after loading image
				flcToy.view.canvas.add(image);
			},
			{ // options to pass to new image object
				left: 200, 
				top: 50, 
				selectable: false, 
			}
		);

		var InvestigateRect = new fabric.Rect({
			left: 0,
			top: DiscoverHeight,
			fill: "#fbfdff",
			width: CANVAS_WIDTH,
			height: InvestigateHeight,
			selectable: false,
		});
		flcToy.view.canvas.add(InvestigateRect);

		fabric.Image.fromURL(
			"images/FLC-circle.png", // path to image
			function(image) { // callback after loading image
				flcToy.view.canvas.add(image);
				image.sendToBack();
				image.bringForward(true);
			},
			{ // options to pass to new object
				left: 145,
				top: 520,
				selectable: false,
			}
		);

		fabric.Image.fromURL(
			"images/Investigate.png", // path to image
			function(image) { // callback after loading image
				flcToy.view.canvas.add(image);
			},
			{ // options to pass to new image object
				left: 125,
				top: 570,
				selectable: false,
			}
		);

		var DeclareRect = new fabric.Rect({
			left: 0,
			top: DiscoverHeight + InvestigateHeight,
			fill: "#fcfff8",
			width: CANVAS_WIDTH,
			height: DeclareHeight,
			selectable: false,
		});
		flcToy.view.canvas.add(DeclareRect);

		fabric.Image.fromURL(
			"images/Declare.png", // path to image
			function(image) { // callback after loading image
				flcToy.view.canvas.add(image);
			},
			{ // options to pass to new image object
				left: 225,
				top: 1200,
				selectable: false,
			}
		);

	})();

	var PERSON_WIDTH = 50;
	var HEAD_RADIUS = PERSON_WIDTH / 2;
	var PLATFORM_ELBOW_ROOM = 20;

	flcToy.view.orphanage = new fabric.Rect({
		width: 972,
		height: 100,
		left: 0,
		top: 1700,
		fill: "#F2F2F2",
		selectable: false,
	});
	flcToy.view.canvas.add(flcToy.view.orphanage);
	fabric.Image.fromURL('images/cycle-btn.png', function(loadedImage) {
		flcToy.view.canvas.add(loadedImage);
	}, {
		selectable: true,
		left: 400,
		top: 700,
		hoverCursor: "pointer",
		hasControls: false,
		hasBorders: false,
		lockMovementX: true,
		lockMovementY: true,
		name: "cycle-btn",
	});

	flcToy.view.setupPlatform = function(image) {
		flcToy.view.canvas.add(image);
		var platform = flcToy.controller.lookupPlatformByURL(image._element.src);

		image.dock = function(token) {
			//console.log("Docking " + token + " into " + image);
			token.top = image.getCenterPoint().y;
			platform.residents.add(token.index);
			flcToy.model.tokenRegistry[token.index].location = platform.location;
			flcToy.view.distributeCrowd(image, platform.residents.list);
			token.setCoords();
		};
		platform.imageObject = image;
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

	flcToy.view.drawNewToken = function(x, y, name, gradeObj, height, color, tokenIndex) {
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
		var token = new fabric.Group([head, shoulders, torso, base, nameplate, gradeLine1, gradeLine2], {
			left: x,
			top: y,
			fill: color,
			originX: "center",
			originY: "bottom",
			hasBorders: false,
			hasControls: false,
			index: tokenIndex,
		});
		token.base = base;
		gradeLine1.setColor("#ffffff");
		gradeLine2.setColor("#ffffff");
		if (gradeObj.line2Size === "large") {
			gradeLine2.setFontSize(36);
		}
		token.itemInGroupIntersectsWithObject = function(other) {
			function aContainsB(rectA, rectB) {
				// sample rect: [thisCoords.tl, thisCoords.tr, thisCoords.br, thisCoords.bl]
				logRound( rectA[0].x, rectB[0].x, rectB[1].x, rectA[1].x, between(rectA[0].x, rectB[0].x, rectB[1].x, rectA[1].x));
				logRound( rectA[3].x, rectB[3].x, rectB[2].x, rectA[2].x, between(rectA[3].x, rectB[3].x, rectB[2].x, rectA[2].x));
				logRound( rectA[0].y, rectB[0].y, rectB[3].y, rectA[3].y, between(rectA[0].y, rectB[0].y, rectB[3].y, rectA[3].y));
				logRound( rectA[1].y, rectB[1].y, rectB[2].y, rectA[2].y, between(rectA[1].y, rectB[1].y, rectB[2].y, rectA[2].y));
				return (
					between(rectA[0].x, rectB[0].x, rectB[1].x, rectA[1].x) && // rectA.tl < rectB.tl < rectB.tr < rectA.tr
					between(rectA[3].x, rectB[3].x, rectB[2].x, rectA[2].x) && // rectA.bl < rectB.bl < rectB.bl < rectA.br
					between(rectA[0].y, rectB[0].y, rectB[3].y, rectA[3].y) && // rectA.tl < rectB.tl < rectB.tr < rectA.tr
					between(rectA[1].y, rectB[1].y, rectB[2].y, rectA[2].y)    // rectA.bl < rectB.bl < rectB.bl < rectA.br
					);
			}
			function logRound() {
				var args = Array.prototype.slice.call(arguments);
				var output = "";
				args.forEach(function(x){
					output += Math.round(x) + " ";
				});
				console.log(output);
			}
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
			//console.log(platformRect.points, tokenBaseRect.points);
			var contains = aContainsB(platformRect.points, tokenBaseRect.points);
			//tokenBaseRect.setColor(intersects || contains) ? "green" : "red");

			flcToy.view.canvas.add(tokenBaseRect, platformRect);
			console.log(intersection.status, contains);

			return intersects || contains;
		};
		flcToy.view.canvas.add(token);
		return token;
	};

	//var Twilight = drawNewToken(26, 200, "Twilight Sparkle", { line1: "Grade", line2: "1", line2Size: "large" }, 60, "#662D8A", "token1");
	//var Pinkie = drawNewToken(150, 200, "Pinkie Pie", { line1: "Kinder-", line2: "garten", line2Size: "small" }, 40, "#ED458D", "token2");

	flcToy.view.dropToken = function(options){
		var draggedToken = options.target;
		if (draggedToken.index.indexOf("token") > -1) { // if this is a token
			var foundADock = false; // more predictable behavior if a token overlaps two platforms
			for (var i = 0; i < flcToy.model.platformRegistry.platformCount; i++) {
				var platformIndex = "platform" + i;
				flcToy.model.platformRegistry[platformIndex].residents.remove(draggedToken.index); // remove token from residence in each platform
				if (!foundADock && draggedToken.itemInGroupIntersectsWithObject(flcToy.model.platformRegistry[platformIndex].imageObject)) { // adapted from http://fabricjs.com/intersection/
					flcToy.model.platformRegistry[platformIndex].imageObject.dock(draggedToken);
					foundADock = true;
				}
				else {
					flcToy.view.distributeCrowd(flcToy.model.platformRegistry[platformIndex].imageObject, flcToy.model.platformRegistry[platformIndex].residents.list); // arrange tokens on the platform the token left
				}
			}
			draggedToken.setCoords();
			if (!foundADock && draggedToken.intersectsWithObject(flcToy.view.orphanage)) {
				flcToy.controller.orphan(draggedToken.index);
				foundADock = true;
			}
		}
	};
	flcToy.view.canvas.on('object:modified', flcToy.view.dropToken);

	flcToy.view.eraseTokenImage = function(tokenImage) {
		flcToy.view.canvas.remove(tokenImage);
	};
})();
