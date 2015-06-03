var story = {
	library: {
		Robert: [
			{ 
				text: "Let's imagine a family with one child named Robert. Robert's parents start him out in Preschool.", 
				tokens: [
					{ //format: string name, string gradeIndex, int height (20-70), string color
						name: "Robert",
						init: ["Robert", "0", 50, "#dd5b5a"],
						platform: "platform0"
					}
				]
			},
			{ text: "Over the next few years, Robert advances from pre-K...", advance: true},
			{ text: "...to Kindergarten...", advance: true },
			{ text: "...then 1st grade...", advance: true },
			{ text: "...then 2nd grade.", advance: true },
			{ text: "Starting in 3rd grade, Robert moves from Discover to Investigate and begins the Family Learning Cycle. He'll continue this cycle until he's ready to begin 9th grade.", advance: true },
			{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
			{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
			{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
			{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
			{ text: "(Keep clicking forward until you've advanced Robert into 9th grade.)", advance: true},
			{ text: "In 9th grade, Robert exits the Family Learning Cycle and begins high school.", advance: true },
			{ text: "(Keep advancing Robert through high school.)", advance: true },
			{ text: "(Keep advancing Robert through high school.)", advance: true },
			{ text: "Robert graduates from high school and is ready to begin a career or leave for college.", advance: true }
		],
		Carpenters: [
			{
				text: "Daniel is starting preschool at the same time Molly is transferring in from 2nd grade in a public school.",
				tokens: [
					{ //format: string name, string gradeIndex, int height (20-70), string color
						name: "Daniel",
						init: ["Daniel", "0", 55, "#ffa544"],
						platform: "platform0"
					}, {
						name: "Molly",
						init: ["Molly", "4", 70, "#f9b5d1"],
						platform: "platform4"
					}
				]
			}, {
				text: "At the end of the year, Molly advances to <i>Exploring Countries and Cultures</i> while Daniel moves into Pre-K.",
				advance: true
			}, {
				text: "The Carpenter family is blessed with two more children, one after another: Matthew and Alicia.",
				advance: true,
				tokens: [
					{
						name: "Matthew",
						init: ["Matthew", "0", 45, "#5377a6"],
						platform: "platform0"
					}
				]
			}, {
				text: "<i>Adventures in US History</i> is only used for students who don't have older siblings in the Family Learning Cycle. [arrow pointing at greyed-out platform] When Daniel finishes first grade, instead of doing <i>Adventures</i>, he joins Molly in the Family Learning Cycle. Mrs. Carpenter will teach <i>Exploration to 1850</i> to both children, giving each child material appropriate for their age level as spelled out in the Teacher's Manual.",
				advance: true,
				tokens: [
					{
						name: "Alicia",
						init: ["Alicia", "0", 35, "#b66de2"],
						platform: "platform0"
					}
				]
			}, {
				text: "As each child finishes the Discover section, they join the rest of the family in the Family Learning Cycle, whatever year they happen to be on.",
				advance: true
			}, {
				text: "As each child finishes the Discover section, they join the rest of the family in the Family Learning Cycle, whatever year they happen to be on.",
				advance: true
			}, {
				text: "As each child finishes the Discover section, they join the rest of the family in the Family Learning Cycle, whatever year they happen to be on.",
				advance: true
			}, {
				text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
				advance: true
			}, {
				text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
				advance: true
			}, {
				text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
				advance: true
			}, {
				text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
				advance: true
			}, {
				text: "Molly graduates from high school just as Daniel enters it.",
				advance: true
			}, {
				text: "Molly graduates from high school just as Daniel enters it.",
				advance: true
			}, {
				text: "Matthew and Amanda each enter High School as they hit 9th grade.",
				advance: true
			}, {
				text: "Matthew and Amanda each enter High School as they hit 9th grade.",
				advance: true
			}, {
				text: "Matthew and Amanda each enter High School as they hit 9th grade.",
				advance: true
			}, {
				text: "Matthew and Amanda each enter High School as they hit 9th grade.",
				advance: true
			}, {
				text: "Matthew and Amanda each enter High School as they hit 9th grade.",
				advance: true
			}, {
				text: "Having successfully educated four children preschool through 12th grade, Mrs. Carpenter retires to a beach in Hawaii.",
				advance: true
			}
		]
	},
	box: jQuery('#storyText'),
	pages: null,
	currentPage: -1,
	tokenRegistry: {},
	turnPageForward: function(){
		var currentPage = story.pages[++story.currentPage];
		console.log(story.currentPage);

		story.box.html(currentPage.text);

		if (currentPage.advance || false) {
			flcToy.controller.advanceCycle();
		}
		// if page has associated tokens, create them
		if (Array.isArray(currentPage.tokens) || false) {
			for (var i = 0; i < currentPage.tokens.length; i++) {
				var currentToken = currentPage.tokens[i];
				var tokenIndex = flcToy.controller.newToken.apply(null, currentToken.init);
				story.tokenRegistry[currentToken.name] = tokenIndex;
				var tokenData = flcToy.model.tokenRegistry[tokenIndex];
				var platformData = flcToy.model.platformRegistry[currentToken.platform];
				flcToy.controller.moveTokenToPlatform(tokenData, platformData);
			}
		}
		// if we're on the first page of the story, disable the Back button
		if (story.currentPage > 0) {
			jQuery('#storyPrevBtn').prop("disabled", false);
		}
	},
	turnPageBackward: function(){
		var oldPage = story.pages[story.currentPage];
		var currentPage = story.pages[--story.currentPage];
		story.box.html(currentPage.text);
		if (Array.isArray(oldPage.tokens) || false) { // if pages has an associated token, orphan it
			oldPage.tokens.forEach(function(token, index, array){
				var tokenIndex = story.tokenRegistry[token.name];
				flcToy.controller.orphan(tokenIndex);
			});
		}
		if (oldPage.advance || false) {
			flcToy.controller.reverseCycle();
		}

		// if we're on the first page of the story, disable the Back button
		if (story.currentPage < 1) {
			jQuery('#storyPrevBtn').prop("disabled", true);
		}
	},
};

jQuery('#storyPrevBtn').click(story.turnPageBackward);
jQuery('#storyNextBtn').click(story.turnPageForward);
setTimeout(function(){
	story.pages = story.library.Carpenters;
	story.turnPageForward();
}, 500);
