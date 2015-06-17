var flcToy = require('./module.js');

var RobertOptions = {
	canvas: "FamilyLearningCycleToy1",
	story: "Robert",
	fwdBtn: jQuery('#storyNextBtn'),
	backBtn: jQuery('#storyPrevBtn')
};

var manualOptions = {
	canvas: "FamilyLearningCycleToy1",
	nameField: jQuery('#nameField'),
	gradeSelect: jQuery('#gradeSelect'),
	heightSlider: jQuery('#heightSlider'),
	colorBoxes: "chooseColor",
	addChildBtn: jQuery('addChildBtn')
};

jQuery(function(){
	flcToy.setup(RobertOptions);
});

