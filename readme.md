# Family Learning Cycle

An [explorable explanation](http://explorableexplanations.com/) of [My Father's World](http://www.mfwbooks.com)'s unique curriculum system. Create tokens representing your children and see how they progress through the curriculum.

## Syntax

In flcToy.js, instantiate a Family Learning Cycle object with `flcToy.setup(options)`. `options` is an object with the following properties:

- `canvas`: ID of canvas to be used.

- `story`: Name of story to be used for the guided tour, or `manual` for manual mode.

- If you pick a story, you need to set `backBtn`, `fwdBtn`, and `textField` so we can shuttle through the story. Each of these should be a jQuery object pointing to an element on the page.

- If you set manual mode, you don't need `textField` or `prevBtn`, but you do need to set up controls for creating tokens. Each of these properties needs a jQuery object corresponding to an element on the page:
  * **nameField** (`<input id="name-field" value="Guy">`)
  * **gradeSelect** (`<select id="grade-select"> <option value="0">Preschool</option> <option value="1">Pre-K</option>`...)
  * **heightSlider** (`<input type="range" id="height-slider" min="20" max="70" step="5">`)
  * **colorBoxes**: Instead of a jQuery object, just provide the `name` of a group of `<input type="radio">`s, each with a `value="#somehexcolor"`.

## License
Released under a [Creative Commons Attribution-NonCommercial 4.0 International](http://creativecommons.org/licenses/by-nc/4.0/) license.
