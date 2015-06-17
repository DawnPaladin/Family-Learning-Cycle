var flcToy = require('./module.js');

var RobertOptions = {
	canvas: "Robert-toy",
	story: "Robert",
	fwdBtn: jQuery('#storyNextBtn'),
	backBtn: jQuery('#storyPrevBtn')
};

var CarpenterOptions = {
	canvas: "Carpenter-toy",
	story: "Carpenters",
	fwdBtn: jQuery('#storyNextBtn2'),
	backBtn: jQuery('#storyPrevBtn2')
};

var manualOptions = {
	canvas: "manual-toy",
	nameField: jQuery('#nameField'),
	gradeSelect: jQuery('#gradeSelect'),
	heightSlider: jQuery('#heightSlider'),
	colorBoxes: "chooseColor",
	addChildBtn: jQuery('addChildBtn')
};

jQuery(function(){
	flcToy.setup(RobertOptions);
	flcToy.setup(CarpenterOptions);
});

