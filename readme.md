# Family Learning Cycle

An [explorable explanation](http://explorableexplanations.com/) of [My Father's World](http://www.mfwbooks.com)'s unique curriculum system. Create tokens representing your children and see how they progress through the curriculum.

## Syntax

Instantiate a Family Learning Cycle object with flcToy.setup(options). Options is an object with the following properties:

- **canvas**: ID of canvas to be used.

- **story**: Name of story to be used for the guided tour, or `manual` for manual mode. 

- If you pick a story, you need to set **backBtn**, **fwdBtn**, and **storyTextField** so we can shuttle through the story. Each of these should be a jQuery object pointing to an element on the page.

- If you set manual mode, an Advance button will appear and handle advancement, but you need to set up controls for creating tokens. Each of these properties needs a jQuery object corresponding to an element on the page:
  * **nameField** (`<input id="nameField" value="Guy">`)
  * **gradeSelect** (`<select id="gradeSelect"> <option value="0">Preschool</option> <option value="1">Pre-K</option>`...) 
  * **heightSlider** (`<input type="range" id="heightSlider" min="20" max="70" step="5">`)
  * **colorBoxes**: Instead of a jQuery object, just provide the `name` of a group of `<input type="radio">`s, each with a `value="#somehexcolor"`.
  * **addChildBtn** (`<button id="addChildBtn" class="toyControl">Add child</button>`)

## License
Released under a [Creative Commons Attribution-NonCommercial 4.0 International](http://creativecommons.org/licenses/by-nc/4.0/) license.
