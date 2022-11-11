class Paragraph {

    // instance variables
    paragraph;
    #spansInParagraph;
    #topOfSpanDifferences;
    linesInParagraph;
    currentLineIdx;
    currentLine;

    // make a line array that holds the words for each line (2d array?)
    constructor(paragraph) {
        this.paragraph = paragraph;
        this.#spansInParagraph; // array of all words/whitespace wrapped in spans in paragraph
        this.#topOfSpanDifferences = [0]; // value in px of current word offset top - previous word offset top
        this.linesInParagraph = [];
        this.currentLineIdx = 0;
    }

    splitIntoSpans() {
        Splitting({ target: this.paragraph, by: "paragraphSplitPlugin" })
        // copy all "spannified" words into array
        this.#spansInParagraph = $(this.paragraph).find("span.word, span.whitespace");
    }

    /*
     - Calls the necessary functions to break a paragraph into LineModules
    */
    calculateLines() {

        this.#populateDifferencesArray();

        this.#populateLineArray();

        this.currentLine = this.linesInParagraph[0];

    }

    /*
     - Populates an array (topOfSpanDifferences) with numbers that represent the difference between the offset top of the current span element and the offset top of the previous span element
     - Offset top is the distance from the top of the page to the top of the span element 
     - topOfSpanDifferences starts at idx 1 because the loop needs to start at 1 to get the offset top of the previous span (can't get previous element when at idx 0), and the arr needs to be the same length as spansInParagraph
    */
    #populateDifferencesArray() {

        for (let i = 1; i < this.#spansInParagraph.length; i++) {

            let currentSpanOffsetTop = $(this.#spansInParagraph[i]).offset().top;
            let previousSpanOffsetTop = $(this.#spansInParagraph[i - 1]).offset().top;

            this.#topOfSpanDifferences.push(
                Math.round(currentSpanOffsetTop - previousSpanOffsetTop)
            );
        }

    }

    /*
     - Uses the differences array to check for line breaks
     - There is a line break if the difference is >= the line height
     - Using startOfLineIdx to track the first word in every line, all elements between that index, and the index where the line breaks, is a line
     - Creates a LineModule for each line, and adds it to linesInParagraph
    */
    #populateLineArray() {

        let startOfLineIdx = 0; // used to keep track of the first word in a line
        let lineHeightOfPreviousWord = 0;

        // use differences array to find all of the lines in the paragraph
        for (let i = 1; i < this.#topOfSpanDifferences.length; i++) {

            lineHeightOfPreviousWord = $(this.#spansInParagraph[i - 1]).outerHeight();

            // if there is a difference that is >= the lineHeight, that means there is a break in the lines - pushes all elements inbetween startOfLineIdx and the linebreak (the line) 
            if (this.#topOfSpanDifferences[i] >= lineHeightOfPreviousWord) {

                this.linesInParagraph.push(
                    new Line(this.#spansInParagraph.slice(startOfLineIdx, i))
                );

                startOfLineIdx = i;

            }

        }

        // account for the last line in the paragraph
        this.linesInParagraph.push(
            new Line(this.#spansInParagraph.slice(startOfLineIdx, this.#topOfSpanDifferences.length))
        );

    }

    // checks if the highlighted line lies (fully) in the viewport of the user
    // #isLineInViewport() {

    //     const topOfViewport = $(window).scrollTop();
    //     const bottomOfViewport = $(window).scrollTop() + window.innerHeight;
    //     const line = $("span.highlighted");
    //     const topOfLine = line.offset().top;
    //     console.log(topOfLine)
    //     const bottomOfLine = line.offset().top + line.outerHeight();

    //     if (topOfLine < topOfViewport || bottomOfLine > bottomOfViewport) {
    //         return false;
    //     }

    //     return true;

    // }

    // there's a problem with giving the words their original color back. 
    // This uses removeAllHighlights, which doesn't have access to the 
    // original colors of the words, so we can't revert them.    
    highlightLine() {

        // get current line, then highlight it
        this.currentLine = this.linesInParagraph[this.currentLineIdx];
        this.currentLine.highlight();

        // scroll into view
        // scroll option 1
        if (!this.currentLine.isInViewport()) {
            $("span.highlighted")[0].scrollIntoView({ behavior: "smooth", block: "center" })
        }

        // scroll option 2
        // $("span.highlighted")[0].scrollIntoView({ behavior: "smooth", block: "center" }) 

    }

    getNumberOfLines() {

        return this.linesInParagraph.length - 1;

    }

}