var storyBox = jQuery('#storyText');
var story = {
	pages: [
		{ text: "Once upon a time..." },
		{ text: "Let's imagine a family with one child named Robert. Robert's parents start him out in Preschool.", token: ["Robert", "0", 50, "#dd5b5a"] },
		{ text: "Over the next few years, Robert advances to Kindergarten...", advance: true},
		{ text: "...then 1st grade...", advance: true },
		{ text: "...then 2nd grade.", advance: true },
		{ text: "Starting in 3rd grade, Robert moves from Discover to Investigate and begins the Family Learning Cycle. He'll continue this cycle until he's ready to begin 9th grade.", advance: true },
		{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
		{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
		{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
		{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
		{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
		{ text: "In 9th grade, Robert exits the Family Learning Cycle and begins high school.", advance: true },
		{ text: "Robert graduates from high school and is ready to begin a career or leave for college.", advance: true }
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
		if (currentPage.advance || false) {
			flcToy.controller.advanceCycle();
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
		if (oldPage.advance || false) {
			// TODO
		}
	},
};

jQuery('#storyPrevBtn').click(story.turnPageBackward);
jQuery('#storyNextBtn').click(story.turnPageForward);
story.turnPageForward();
