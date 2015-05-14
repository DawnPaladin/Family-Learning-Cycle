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
	tokenRegistry: {},
	turnPageForward: function(){
		var currentPage = story.pages[++story.currentPage];
		storyBox.text(currentPage.text);
		if (Array.isArray(currentPage.token) || false) { // if page has an associated token, create it
			var tokenIndex = flcToy.controller.newToken.apply(null, currentPage.token);
			var tokenName = currentPage.token[0];
			story.tokenRegistry[tokenName] = tokenIndex;
		}
	},
	turnPageBackward: function(){
		var oldPage = story.pages[story.currentPage];
		var currentPage = story.pages[--story.currentPage];
		storyBox.text(currentPage.text);
		if (Array.isArray(oldPage.token) || false) { // if pages has an associated token, orphan it
			var tokenName = oldPage.token[0];
			var tokenIndex = story.tokenRegistry[tokenName];
			flcToy.controller.orphan(tokenIndex);
		}
	},
};

jQuery('#storyPrevBtn').click(story.turnPageBackward);
jQuery('#storyNextBtn').click(story.turnPageForward);
story.turnPageForward();
