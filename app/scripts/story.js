function flcStoryFactory(model, view) {

	var story = {
		library: {
			Robert: [
				{
					text: "Let's imagine a family with one child named Robert. Robert's parents start him out in Preschool.",
					tokens: [
						{ //format: string name, string gradeIndex, int height (20-70), string color
							name: "Robert",
							init: ["Robert", "0", 50, "#e77c09", true],
							platform: "hospital"
						}
					]
				},
				{ text: "Over the next few years, Robert advances from pre-K...", advance: true},
				{ text: "...to Kindergarten...", advance: true },
				{ text: "...then 1st grade...", advance: true },
				{ text: "...then 2nd grade. Now Robert is done with the Discover section, so next year he'll move to the Investigate section and begin the Family Learning Cycle, where he'll stay through middle school.", advance: true },
				{ text: "<i>Exploring Countries and Cultures</i> (ECC) gives Robert an overview of the whole planet and a foundation for a chronological study of history. He'll see the physical and spiritual needs of mankind while learning about ecosystems and lifestyles in different parts of the world. Robert will return to ECC to study it in more detail once he's finished the rest of the Family Learning Cycle.", advance: true },
				{ text: "With <i>Creation to the Greeks</i>, Robert begins a four-year chronological study of history. This year is dedicated to an overview of the Old Testament, which serves as a key history text and allows students to study the Bible and ancient history side by side.", advance: true },
				{ text: "<i>Rome to the Reformation</i> provides perspective on the New Testament by showing what life was like under Roman rule. We follow the development of the church and study the Middle Ages, culminating with the Renaissance and Reformation.", advance: true },
				{ text: "In <i>Exploration to 1850</i>, our fourth year of chronological history, we explore the New World with Leif Ericsson, Christopher Columbus, and our Founding Fathers. We study the history of America from colonial times to the California gold rush, learn about the courage and faith of many who came to America, and see how U.S. and world history are interrelated.", advance: true },
				{ text: "<i>1850 to Modern Times</i> rounds out our study of chronological history by studying states and capitals, reciting the Gettysburg Address, solving cryptography puzzles, and baking Vietnamese Apricot Coconut Cake, among other things.", advance: true },
				{ text: "In 8th grade, Robert returns to <i>Exploring Countries and Cultures</i> to study it in greater depth than was possible in 3rd grade. As a 3rd grader, Robert studied countries by writing a sentence about each one. Now he studies countries by writing reports.", advance: true },
				{ text: "In 9th grade, Robert exits the Family Learning Cycle and begins high school.", advance: true },
				{ text: "(Keep advancing Robert through high school.)", advance: true },
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
							init: ["Daniel", "0", 55, "#e77c09", true],
							platform: "hospital"
						}, {
							name: "Molly",
							init: ["Molly", "4", 70, "#e94d8e", true],
							platform: "platform4"
						}
					],
					triggerFunc: function() { view.bridgeOut.setup(); }
				}, {
					text: "At the end of the year, Molly advances to <i>Exploring Countries and Cultures</i> while Daniel moves into Pre-K.",
					advance: true
				}, {
					text: "The Carpenter family is blessed with two more children, one after another: Matthew and Alicia.",
					advance: true,
					tokens: [
						{
							name: "Matthew",
							init: ["Matthew", "0", 45, "#5377a6", true],
							platform: "hospital"
						}
					],
					triggerFunc: function() { view.bridgeOut.hide(); }
				}, {
					text: "<i>Adventures in US History</i> is only used for students who don't have older siblings in the Family Learning Cycle. When Daniel finishes first grade, instead of doing <i>Adventures</i>, he joins Molly in the Family Learning Cycle, where he'll get similar content at a higher level. Mrs. Carpenter will teach <i>Exploration to 1850</i> to both children, giving each child material appropriate for their age level as spelled out in the Teacher's Manual.",
					advance: true,
					tokens: [
						{
							name: "Alicia",
							init: ["Alicia", "0", 35, "#8145a6", true],
							platform: "hospital"
						}
					],
					triggerFunc: function() {
						var adv = model.platformRegistry.ADV;
						var platformCoords = view.lookupPlatformCenter(adv.imageObject);
						view.bridgeOut.show(250);
						window.setTimeout(function(){
							view.flash(view.bridgeOut.image, 250, 2);
						}, 250);
					}
				}, {
					text: "As each child finishes the Discover section (skipping <i>Adventures in US History</i>), they join the rest of the family in the Family Learning Cycle, whatever year they happen to be on.",
					advance: true,
					triggerFunc: function() { view.bridgeOut.hide(250); }
				}, {
					text: "As each child finishes the Discover section (skipping <i>Adventures in US History</i>), they join the rest of the family in the Family Learning Cycle, whatever year they happen to be on.",
					advance: true
				}, {
					text: "As each child finishes the Discover section (skipping <i>Adventures in US History</i>), they join the rest of the family in the Family Learning Cycle, whatever year they happen to be on.",
					advance: true
				}, {
					text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
					advance: true
				}, {
					text: "When Molly hits 9th grade, she's finished the cycle and moves on to Declare. Her younger siblings continue the cycle without her.",
					advance: true
				}, {
					text: "When Daniel joined the Family Learning Cycle in 2nd grade, he did <i>Exploration to 1850</i> because that's what Molly was on at the time. Now he's doing <i>Exploration to 1850</i> again in 7th grade, learning the material in far more depth, solidifying his knowledge.",
					advance: true
				}, {
					text: "As with <i>Exploration to 1850</i>, Daniel has studied <i>1850 to Modern Times</i> before, but he's now old enough to grasp it on a level he couldn't in 3rd grade. The Teacher's Manual has additional reading, exercises, and projects that an 8th grader is able to tackle on his own.",
					advance: true
				}, {
					text: "Molly graduates from high school just as Daniel enters it.",
					advance: true
				}, {
					text: "At the end of 8th grade, Matthew and Alicia each exit the Family Learning Cycle and enter high school.",
					advance: true
				}, {
					text: "At the end of 8th grade, Matthew and Alicia each exit the Family Learning Cycle and enter high school.",
					advance: true
				}, {
					text: "At the end of 8th grade, Matthew and Alicia each exit the Family Learning Cycle and enter high school.",
					advance: true
				}, {
					text: "At the end of 8th grade, Matthew and Alicia each exit the Family Learning Cycle and enter high school.",
					advance: true
				}, {
					text: "At the end of 8th grade, Matthew and Alicia each exit the Family Learning Cycle and enter high school.",
					advance: true
				}, {
					text: "At the end of 8th grade, Matthew and Alicia each exit the Family Learning Cycle and enter high school.",
					advance: true
				}, {
					text: "Having successfully educated four children preschool through 12th grade, Mrs. Carpenter retires to a beach in Hawaii.",
					advance: true
				}
			]
		},
		box: null,
		pages: null,
		currentPage: -1,
		maxProgress: -1,
		tokenRegistry: {},
		historyDepth: 0,
	};

	return story;
}
