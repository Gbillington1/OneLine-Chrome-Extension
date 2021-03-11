class Paragraph {
    // make a line array that holds the words for each line (2d array?)
    constructor(paragraph) {
        this.paragraph = paragraph; 
        this.currentParagraphIndex = 0;
        this.spansInParagraph; // array of all words/whitespace wrapped in spans in paragraph
        this.topOfWordDifferences = [0]; // value in px of current word offset top - previous word offset top
        this.linesInParagraph = [];
    }

    splitIntoSpans() {
        Splitting( { target: this.paragraph, by: "paragraphSplitPlugin" } )
        // copy all "spannified" words into array
        this.spansInParagraph = $(this.paragraph).find("span.word, span.whitespace");
    }

    calculateLines() {
        // added 0 to first element of topOfWordDifferences so it would have the same length as spansInParagraph - this loop MUST start at i = 1
        // calculates the difference between the offset top of the current word and the offset top of the previous word
        
        for (let i = 1; i < this.spansInParagraph.length; i++) {
         
            let currentWordOffsetTop = $(this.spansInParagraph[i]).offset().top; 
            let previousWordOffsetTop = $(this.spansInParagraph[i - 1]).offset().top; 
            

            this.topOfWordDifferences.push(
                Math.round(currentWordOffsetTop - previousWordOffsetTop)
            );
        }

        let startOfLineIdx = 0; // used to keep track of the first word in a line
        let lineHeightOfPreviousWord = 0;

        // use differences calculated in previous loop to find all of the lines in the paragraph
        for (let i = 0; i < this.topOfWordDifferences.length; i++) {

            if (i > 0) {
                lineHeightOfPreviousWord = $(this.spansInParagraph[i - 1]).outerHeight();
            }

            // if there is a difference that is bigger than the lineHeight, that means there is a break in the lines - pushes all elements inbetween startOfLineIdx and the linebreak (the line) 
            if (this.topOfWordDifferences[i] > lineHeightOfPreviousWord) {

                this.linesInParagraph.push(
                    this.spansInParagraph.slice(startOfLineIdx, i)
                );

                startOfLineIdx = i;

            }

        }

        this.linesInParagraph.push(
            this.spansInParagraph.slice(startOfLineIdx, this.topOfWordDifferences.length)
        );

    }

    // will be highlight line 
    highlightEntireParagraph() {
        $(this.paragraph).find("span.whitespace, span.word").addClass("highlighted");
    }

    removeHighlight() {
        $(this.paragraph).find("span.whitespace, span.word").removeClass("highlighted");
    }

}