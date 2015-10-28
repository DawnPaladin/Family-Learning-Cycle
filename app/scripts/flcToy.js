/* jshint latedef: false */
/* globals flcModelFactory, flcViewFactory, flcControllerFactory, flcStoryFactory */

var imgDir = 'images';

function toyFactory() {

	var flcToy = {};

	flcToy.setup = function(options) {
		var manual = options.story === "manual";
		flcToy.model = flcModelFactory();
		flcToy.view = flcViewFactory(fabric, flcToy.model, imgDir, options.canvas, manual);
		flcToy.view.setup(options.canvas, manual);
		flcToy.story = flcStoryFactory(flcToy.model, flcToy.view);
		flcToy.controller = flcControllerFactory(flcToy.model, flcToy.view, flcToy.story);


		var platformPromises = [];

		var DiscoverBaseX = 90;
		var DiscoverBaseY = manual ? 550 : 200; // foyer height also defined in flcToy.view.setup
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

		platformPromises.push(flcToy.controller.newPlatform( 25, DeclareBase + 105, 'college', imgDir+'/graduation.png'));
		platformPromises.push(flcToy.controller.newPlatform(DiscoverBaseX - 500, DiscoverBaseY, 'hospital', imgDir+'/hospital.png'));

		if (manual) {
			platformPromises.push(flcToy.controller.newPlatform( 400, 180, 'staging', imgDir+'/staging.png'));
		}

		jQuery.when.apply(jQuery, platformPromises).then(function(){ // when all promises in platformPromises are fulfilled (see http://stackoverflow.com/a/5627301/1805453)
			if (manual) {
				options.controls.find('input[type=radio], select' ).on('change', function() { flcToy.controller.tokenPreview.changeHandler(options); });
				options.controls.find('input[type!=radio], select').on('input',  function() { flcToy.controller.tokenPreview.changeHandler(options); });
				options.nextBtn.click(flcToy.controller.manualAdvanceHandler);
			} else {
				options.nextBtn.click(flcToy.controller.turnPageForward);
				options.prevBtn.click(flcToy.controller.turnPageBackward);
				flcToy.story.name = options.story;
				flcToy.story.pages = flcToy.story.library[flcToy.story.name];
				flcToy.story.box = options.textField;
				flcToy.story.nextBtn = options.nextBtn;
				flcToy.story.prevBtn = options.prevBtn;
				flcToy.controller.turnPageForward();
			}
		});
	};

	return flcToy;
}

var RobertOptions = {
	canvas: "Robert-toy",
	story: "Robert",
	nextBtn: jQuery('#Robert-toy-wrapper .story-next-btn'),
	prevBtn: jQuery('#Robert-toy-wrapper .story-prev-btn'),
	textField: jQuery('#Robert-toy-wrapper .story-text'),
};

var CarpenterOptions = {
	canvas: "Carpenter-toy",
	story: "Carpenters",
	nextBtn: jQuery('#Carpenter-toy-wrapper .story-next-btn'),
	prevBtn: jQuery('#Carpenter-toy-wrapper .story-prev-btn'),
	textField: jQuery('#Carpenter-toy-wrapper .story-text'),
};

var manualOptions = {
	canvas: "sandbox-toy",
	story: "manual",
	controls: jQuery('#sandbox-toy-wrapper .toy-controls'),
	nextBtn: jQuery('#sandbox-toy-wrapper .story-next-btn'),
	nameField: jQuery('#name-field'),
	gradeSelect: jQuery('#grade-select'),
	heightSlider: jQuery('#height-slider'),
	colorBoxes: "chooseColor",
};

var toy1 = toyFactory();
toy1.setup(RobertOptions);
var toy2 = toyFactory();
toy2.setup(CarpenterOptions);
var toy3 = toyFactory();
toy3.setup(manualOptions);
