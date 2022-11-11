/*
 - Module that represents a single line
 - Controls the highlighting of the line
 - Will be used to add more features that are line specific in the future
*/

/*
    What makes up a line?
    - array of words
    - color of the words (abstract if you make a Word class)
    - color of the line
    - location of where it is in the paragraph? (line number relative to paragraph, not sure if needed) 

    What can a line do? 
    - highlight itself
    - remove the highlight from itself
    - change the color of the words based on line highlight color
    - change the color of the line 
    - check if the line is viewable on users screen (viewport) 
    - access instance and private vars through getters and setters
*/

class Line {

    #spansInLine;
    #colorsOfWords; // array of original color of each span in the line
    #color;

    constructor(spansInLine) {
        this.#spansInLine = spansInLine;
        this.#colorsOfWords = [];
        this.#color = getComputedStyle(document.documentElement).getPropertyValue('--active-color');
    }

    // helper function for calculateWordColorWithYIQ, converts colorString to rgb object
    #convertToRGB(colorString) {

        // returns true if the string is a hex color, false otherwise
        const regex = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$")
        let r, g, b;

        // is hex
        if (regex.test(colorString)) {
            r = parseInt(colorString.slice(1, 3), 16)
            g = parseInt(colorString.slice(3, 5), 16)
            b = parseInt(colorString.slice(5, 7), 16)
            // is rgb
        } else {
            let rgb = colorString.match(/\d+/g);
            r = rgb[0];
            g = rgb[1];
            b = rgb[2];
        }

        return { r, g, b }
    }

    // use YIQ to calculate the optimial color of the word (easiest to read) 
    #calculateWordColorWithYIQ(backgroundColorString) {

        const rgb = this.#convertToRGB(backgroundColorString);
        const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';

    }

    highlight() {

        let backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--active-color');
        let optimalWordColor = this.#calculateWordColorWithYIQ(backgroundColor);
        for (let i = 0; i < this.#spansInLine.length; i++) {

            this.#spansInLine[i].classList.add("highlighted");
            // save the color of the text of each word in the line (to an array?)
            this.#colorsOfWords.push($(this.#spansInLine[i]).css("color"));
            // change the color of the text of each word in the line
            $(this.#spansInLine[i]).css("color", optimalWordColor);

        }

    }

    removeHighlight() {

        for (let i = 0; i < this.#spansInLine.length; i++) {
            // revert the value of the word back to the original color
            $(this.#spansInLine[i]).css("color", this.#colorsOfWords[i]);
            this.#spansInLine[i].classList.remove("highlighted");
        }

    }

    isInViewport() {

        const topOfViewport = $(window).scrollTop();
        const bottomOfViewport = $(window).scrollTop() + window.innerHeight;
        const line = $("span.highlighted");
        const topOfLine = line.offset().top;
        const bottomOfLine = line.offset().top + line.outerHeight();

        if (topOfLine < topOfViewport || bottomOfLine > bottomOfViewport) {
            return false;
        }

        return true;

    }

    // getters and setters
    get spansInLine() {
        return this.#spansInLine;
    }

    get colorOfWords() {
        return this.#colorsOfWords;
    }

    get color() {
        return this.#color; 
    }

    set color(color) {
        this.#color = color;
        document.documentElement.style.setProperty("--active-color", color);
    }
}