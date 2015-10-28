function flcViewFactory(fabric, model, imgDir, canvasID, manual) {
	var view = {};

	view.setup = function(canvasID, manual) {
		view.canvas = new fabric.Canvas(canvasID);

		view.canvas.selection = false;

		function disableScroll() {
			view.canvas.allowTouchScrolling = false;
		}
		function enableScroll() {
			view.canvas.allowTouchScrolling = true;
		}
		enableScroll();
		view.canvas.on('object:moving', disableScroll);
		view.canvas.on('mouse:up', enableScroll);

		// draw background

		var foyerHeight = manual ? 350 : 0; // also defined in setup
		var DiscoverHeight = 320;
		var InvestigateHeight = 760;
		var DeclareHeight = 220;

		var CANVAS_WIDTH = 972;
		var CANVAS_HEIGHT = foyerHeight + DiscoverHeight + InvestigateHeight + DeclareHeight + 200;

		var DiscoverRect = new fabric.Rect({
			left: 0,
			top: foyerHeight,
			fill: "#fef9f0",
			width: CANVAS_WIDTH,
			height: DiscoverHeight,
			selectable: false,
		});
		view.canvas.add(DiscoverRect);

		fabric.Image.fromURL(
			imgDir+"/Discover.png", // path to image
			function(image) { // callback after loading image
				view.canvas.add(image);
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
		view.canvas.add(InvestigateRect);

		fabric.Image.fromURL(
			imgDir+"/FLC-circle.png", // path to image
			function(image) { // callback after loading image
				view.canvas.add(image);
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
				view.canvas.add(image);
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
		view.canvas.add(DeclareRect);

		fabric.Image.fromURL(
			imgDir+"/Declare.png", // path to image
			function(image) { // callback after loading image
				view.canvas.add(image);
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
			view.orphanage.visible = true;
		}
		function hideOrphanage() {
			view.orphanage.visible = false;
		}

		if (manual === true) {
			var tokenPreviewRect = new fabric.Rect({
				left: 0,
				top: 20,
				stroke: "#DEDEDD",
				strokeWidth: 13,
				fill: "transparent",
				width: 225,
				height: 225,
				selectable: false,
			});
			var tokenPreviewText = new fabric.Text("PREVIEW", {
				fontFamily: "Source Sans Pro",
				fontSize: 15,
				fill: "#919191",
				top: 0,
				left: 118,
				originX: "center",
				selectable: false,
			});
			fabric.Image.fromURL(
				imgDir+"/arrow.png", // path to image
				function(image) { // callback after loading image
					view.canvas.add(image);
				},
				{ // options to pass to new image object
					left: 200,
					top: 80,
					selectable: false,
				}
			);
			fabric.Image.fromURL(
				imgDir+"/Auto-place.png", // path to image
				function(image) { // callback after loading image
					view.canvas.add(image);
				}, { // options to pass to new image object
					left: 500,
					top: 255,
					hasControls: false,
					hasBorders: false,
					lockMovementX: true,
					lockMovementY: true,
					hoverCursor: "pointer",
					name: 'auto-place-btn',
				}
			);
			var autoPlaceText = new fabric.Text(
				"or drag them wherever you want",
				{
					fontFamily: "Source Sans Pro",
					fontSize: 16,
					left: 620,
					top: 272,
					textAlign: "left",
					selectable: false,
				});
			view.canvas.add(tokenPreviewRect, tokenPreviewText, autoPlaceText);
			view.showOccupancyError = function() {
				jQuery('#sandbox-toy-wrapper .story-text').hide();
				jQuery('#sandbox-toy-wrapper .occupancy-error').css('display', 'inline-block');
				jQuery('#sandbox-toy-wrapper .story-next-btn').attr('src', 'images/next-btn-disabled.png').css('cursor', 'default');
			};
			view.hideOccupancyError = function() {
				jQuery('#sandbox-toy-wrapper .story-text').show();
				jQuery('#sandbox-toy-wrapper .occupancy-error').css('display', 'none');
				jQuery('#sandbox-toy-wrapper .story-next-btn').attr('src', 'images/next-btn.png').css('cursor', 'pointer');
			};

			fabric.Image.fromURL(imgDir+'/delete-plain.png', function(loadedImage) {
				view.canvas.add(loadedImage);
				view.orphanage = loadedImage;
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
		} else { // not manual
			view.showOccupancyError = function() {
				console.error("Story-based FLC toys shouldn't have occupancy errors.");
			};
			view.hideOccupancyError = function() {
				// do nothing
			};
		}

		view.distributeCrowd = function(platformImage, residentsList) { // distribute crowd of tokens across the platform
			var crowdWidth = (residentsList.length - 1) * PERSON_WIDTH + (residentsList.length - 1) * PLATFORM_ELBOW_ROOM; // distance between first and last midpoints
			var crowdLeftEdge = -crowdWidth / 2;
			for (var i = 0; i < residentsList.length; i++) {
				var offsetFromCenter = crowdLeftEdge + (PERSON_WIDTH + PLATFORM_ELBOW_ROOM) * i;
				model.tokenRegistry[residentsList[i]].canvasGroup.left = platformImage.getCenterPoint().x + offsetFromCenter;
				model.tokenRegistry[residentsList[i]].canvasGroup.setCoords();
			}
		};

		view.crowdDistribution = function(originImageObject, memberCount) {
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

		view.drawNewToken = function(x, y, name, gradeObj, height, color, tokenIndex, lockMovement) {
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
			var nameplateNotEmpty = nameplate.getText().length > 0;
			var token = new fabric.Group([head, shoulders, torso, base, nameplateNotEmpty ? nameplateBG : nameplate, nameplate, gradeLine1, gradeLine2], {
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
				//tokenBaseRect.setColor((intersects || contains) ? "green" : "red");
				//view.canvas.add(tokenBaseRect, platformRect);
				//console.log(intersection.status, contains);

				return intersects || contains;
			};
			view.canvas.add(token);
			return token;
		};

		view.eraseTokenImage = function(tokenImage) {
			view.canvas.remove(tokenImage);
		};

		view.disablePlatform = function(platform) {
			console.assert((typeof platform === "object" && typeof platform.imageObject === "object" && typeof platform.name === "string"), "This is not a platformData:", platform);
			platform.disabled = true;
			platform.imageObject.opacity = 0.5;
			view.canvas.renderAll();
		};
		view.enablePlatform = function(platform) {
			console.assert((typeof platform === "object" && typeof platform.imageObject === "object" && typeof platform.name === "string"), "This is not a platformData:", platform);
			platform.disabled = false;
			platform.imageObject.opacity = 1;
			view.canvas.renderAll();
		};

		view.ripple = function(x, y, color) {
			// var fill = new fabric.Circle({
			// 	top: y,
			// 	left: x,
			// 	radius: 1,
			// 	fill: color,
			// 	opacity: 0.3,
			// 	originX: "center",
			// 	originY: "center",
			// });
			// view.canvas.add(fill);
			// fill.animate({radius: CANVAS_HEIGHT, opacity: 0}, {
			// 	duration: 1000,
			// 	onChange: view.canvas.renderAll.bind(view.canvas),
			// 	onComplete: function(){ view.canvas.remove(fill); }
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
			view.canvas.add(stroke);
			stroke.animate({radius: CANVAS_HEIGHT}, {
				duration: 1000,
				onChange: view.canvas.renderAll.bind(view.canvas),
				onComplete: function(){ view.canvas.remove(stroke); }
			});
		};
		view.flash = function(image, duration, quantity) {
			if (quantity > 0) {
				image.animate(
					{ 
						opacity: 0,
					},
					{ 
						duration: duration,
						easing: fabric.util.ease.easeInQuint,
						onChange: view.canvas.renderAll.bind(view.canvas),
						onComplete: function(){
							image.animate(
								{ 
									opacity: 1,
								},
								{
									duration: duration,
									easing: fabric.util.ease.easeOutQuint,
									onChange: view.canvas.renderAll.bind(view.canvas),
									onComplete: function(){
										view.flash(image, duration, quantity - 1);
									}
								}
							);
						}
					}
				);
			}
		};

		view.lookupPlatformCenter = function(platformImage) {
			console.assert(typeof platformImage.selectable === "boolean", "This is not a platformImage:", platformImage);
			var platformCenter = {
				x: platformImage.oCoords.mt.x,
				y: platformImage.oCoords.ml.y
			};
			return platformCenter;
		};
		view.lookupCanvasObjectByURL = function(url) { // presently unused, but possibly useful
			for (var i = 0; i < view.canvas._objects.length; i++) {
				try {
					if (view.canvas._objects[i]._element.src.indexOf(url) > 0) {
						return view.canvas._objects[i];
					}
				}
				catch (error) {
					console.error(error);
				}
			}
		};
		view.walkToken = function(tokenData, coords) {
			console.assert((typeof tokenData === "object" && typeof tokenData.name === "string"), "This is not a tokenData:", tokenData);
			tokenData.canvasGroup.animate(coords, {
				duration: 750,
				easing: fabric.util.ease.easeInOutCubic,
				onChange: view.canvas.renderAll.bind(view.canvas),
			});
		};

		view.bridgeOut = {
			setup: function() {
				var platformCoords = view.lookupPlatformCenter(model.platformRegistry.ADV.imageObject);
				var This = this;
				fabric.Image.fromURL(
					imgDir+'/do-not-enter.png', // path to image
					function(image){ view.canvas.add(image); view.bridgeOut.image = image; }, // callback after loading image
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
			show: function(duration) {
				view.bridgeOut.image.animate(
					{ opacity: 1 },
					{ 
						duration: duration,
						easing: fabric.util.ease.easeInQuint,
						onChange: view.canvas.renderAll.bind(view.canvas),
					}
				);
			},
			hide: function(duration) {
				view.bridgeOut.image.animate(
					{ opacity: 0 },
					{ 
						duration: duration,
						easing: fabric.util.ease.easeInQuint,
						onChange: view.canvas.renderAll.bind(view.canvas),
					}
				);
			}
		};

		var fadeDuration = 250;
		fabric.Image.fromURL(
			imgDir+'/active-platform.png', // path to image
			function(image) { 
				view.canvas.add(image); 
				image.bringToFront();
				view.cycleYear = image;
			},
			{
				originX: "center",
				originY: "center",
				selectable: false,
				opacity: 0,
			}
		);
		view.setCycleYear = function(platformIndex) {
			console.assert((typeof platformIndex === "string"), "This is not a platformIndex:", platformIndex);

			function hideCycleYear(callback) {
				view.cycleYear.animate(
					{ opacity: 0 },
					{ 
						duration: fadeDuration,
						easing: fabric.util.ease.easeInQuint,
						onChange: view.canvas.renderAll.bind(view.canvas),
						onComplete: callback
					}
				);
			}
			function showCycleYear(coords, callback) {
				view.cycleYear.set({
					left: coords.x,
					top: coords.y + 2,
				});
				view.cycleYear.animate({opacity: 1}, {
					duration: fadeDuration,
					easing: fabric.util.ease.easeInOutCubic,
					onChange: view.canvas.renderAll.bind(view.canvas),
					onComplete: callback
				});
			}
			if (!platformIndex || platformIndex === "none") {
				hideCycleYear();
				return;
			}
			var platformData = model.platformRegistry[platformIndex];
			var platformCenter = view.lookupPlatformCenter(platformData.imageObject);
			hideCycleYear(function() { showCycleYear(platformCenter); });
		};

		function preventLeaving(e) { // from https://groups.google.com/d/msg/fabricjs/DHvNmjJfaYM/KgtR3tfbfkMJ
			var myCanvas = view.canvas;
			var activeObject = e.target;
			var canvasLowerEdge = { relativeTo: {} };
			var windowLowerEdge = { relativeTo: {} };
			var canvasUpperEdge = { relativeTo: {} };
			var windowUpperEdge = { relativeTo: {} };
			var windowCenter = { relativeTo: {} };
			var windowHeight = jQuery(window).height();
			var tokenHeight = activeObject.get('height');
			windowLowerEdge.relativeTo.page   = Math.round(jQuery(document).scrollTop() + jQuery(window).height());
			canvasUpperEdge.relativeTo.page   = Math.round(jQuery(myCanvas.lowerCanvasEl).offset().top);
			windowLowerEdge.relativeTo.canvas = Math.round(windowLowerEdge.relativeTo.page - canvasUpperEdge.relativeTo.page);
			canvasUpperEdge.relativeTo.canvas = Math.round(tokenHeight);
			canvasLowerEdge.relativeTo.canvas = Math.round(myCanvas.getHeight());
			windowUpperEdge.relativeTo.canvas = Math.round(windowLowerEdge.relativeTo.canvas - windowHeight);
			windowCenter.relativeTo.canvas    = Math.round((windowHeight / 2) + windowUpperEdge.relativeTo.canvas);
			if (windowCenter.relativeTo.canvas < 0) { windowCenter.relativeTo.canvas = tokenHeight; } // window center is outside the canvas, so stick the token to the window top. Current page structure is such that this can't happen at the bottom of the sandbox canvas, only the top.
			/*console.log(
				"windowLowerEdge.relativeTo.page", windowLowerEdge.relativeTo.page, 
				"canvasUpperEdge.relativeTo.page", canvasUpperEdge.relativeTo.page, 
				"windowLowerEdge.relativeTo.canvas", windowLowerEdge.relativeTo.canvas,
				"windowUpperEdge.relativeTo.canvas", windowUpperEdge.relativeTo.canvas,
				"windowCenter.relativeTo.canvas", windowCenter.relativeTo.canvas
			);*/

			if ((activeObject.get('left') - (activeObject.get('width') / 2) < 0)) {
				activeObject.set('left', activeObject.get('width') / 2); 
			}
			if ((activeObject.get('top') - (activeObject.get('height'))) < 0) {
				if ((activeObject.get('top') - (activeObject.get('height'))) < -4000) { // out of window in Firefox
					activeObject.set('top', windowCenter.relativeTo.canvas);
				} else { // off top
					activeObject.set('top', canvasUpperEdge.relativeTo.canvas);
				}
			}
			if (activeObject.get('left') + (activeObject.get('width') / 2) > myCanvas.getWidth()) {
				var positionX = myCanvas.getWidth() - (activeObject.get('width'))  / 2;
				activeObject.set('left', positionX > myCanvas.getWidth() / 2 ? positionX : myCanvas.getWidth() / 2);
			}
			if (activeObject.get('top') > myCanvas.getHeight()) { // off bottom of canvas
				var positionY = myCanvas.getHeight() - (activeObject.get('height')/ 2);
				activeObject.set('top', canvasLowerEdge.relativeTo.canvas);
			}
			if (activeObject.get('top') < activeObject.get('height')) { // prevent token tops from sticking off canvas
				activeObject.set('top', activeObject.get('height'));
			}
		}
		view.canvas.observe('object:moving', preventLeaving);
	}; // end view setup function

	return view;
}
