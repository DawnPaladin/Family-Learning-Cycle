var toy1 = require('flcToy');

jQuery('#storyPrevBtn').click(toy1.story.turnPageBackward);
jQuery('#storyNextBtn').click(toy1.story.turnPageForward);
setTimeout(function(){
	toy1.story.pages = toy1.story.library.Carpenters;
	toy1.story.turnPageForward();
}, 500);
