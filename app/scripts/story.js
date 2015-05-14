var storyBox = jQuery('#storyText');
var story = {
	pages: [
		{
			text: "Once upon a time..."
		},
		{ 
			text: "Let's imagine a family with one child named Robert. Robert's parents start him out in Preschool.",
			token: ["Robert", "0", 50, "#dd5b5a"]
		},
		{ 
			text: "Over the next few years, Robert advances to Kindergarten, then 1st grade, then 2nd grade.",
		}
	],
	currentPage: -1,
	turnPageForward: function(){
		var currentPage = story.pages[++story.currentPage];
		storyBox.text(currentPage.text);
		if (Array.isArray(currentPage.token) || false) { // if page has an associated token, create it
			var tokenIndex = flcToy.controller.newToken.apply(null, currentPage.token);
			currentPage.tokenIndex = tokenIndex;
		}
	},
	turnPageBackward: function(){
		var oldPage = story.pages[story.currentPage];
		var currentPage = story.pages[--story.currentPage];
		storyBox.text(currentPage.text);
		if (Array.isArray(oldPage.token) || false) { // if pages has an associated token, orphan it
			flcToy.controller.orphan(oldPage.tokenIndex);
		}
	},
};

jQuery('#storyPrevBtn').click(story.turnPageBackward);
jQuery('#storyNextBtn').click(story.turnPageForward);
story.turnPageForward();
