var flcToy = require('./module.js');

var RobertOptions = {
	story: "Robert",
	fwdBtn: jQuery('#storyNextBtn'),
	backBtn: jQuery('#storyPrevBtn')
};

jQuery(function(){
	window.setTimeout(function() {
		flcToy.setup(RobertOptions);
	}, 1000);
});




