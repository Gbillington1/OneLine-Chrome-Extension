/* 
 - Manipulates the given paragraph
 - Splits paragraph into span elements
 - Highlights all span elements
*/

const ParagraphModule = (paragraph) => {

    /* Global Variables */

    /* array of all span elements containing words/special chars in the paragraph */
    let spansInParagraph; 
    
    /* 
     - array of value (in px) of current word distance from top of page
       to previous word distance from top of page 
     - added 0 to first element to length would match spansInParagraph.lenght (see calculate lines)
    */
    let topOfWordDifferences = [0];
    
    /* array of Line modules */
    let linesInParagraph = []; 

    /* Module fucntions */

    const splitIntoSpans = () => {

        Splitting( { target: paragraph, by: "paragraphSplitPlugin" } )
        // copy all "spannified" words into array
        spansInParagraph = $(paragraph).find("span.word, span.whitespace");

    }

    // break down into different functions
    const calculateLines = () => {

        // added 0 to first element of topOfWordDifferences so it would have the same length as spansInParagraph - this loop MUST start at i = 1
        // calculates the difference between the offset top of the current word and the offset top of the previous word
        
        for (let i = 1; i < spansInParagraph.length; i++) {
         
            let currentWordOffsetTop = $(spansInParagraph[i]).offset().top; 
            let previousWordOffsetTop = $(spansInParagraph[i - 1]).offset().top; 
            

            topOfWordDifferences.push(
                Math.round(currentWordOffsetTop - previousWordOffsetTop)
            );
        }

        let startOfLineIdx = 0; // used to keep track of the first word in a line
        let lineHeightOfPreviousWord = 0;

        // use differences calculated in previous loop to find all of the lines in the paragraph
        for (let i = 0; i < topOfWordDifferences.length; i++) {

            if (i > 0) {
                lineHeightOfPreviousWord = $(spansInParagraph[i - 1]).outerHeight();
            }

            // if there is a difference that is bigger than the lineHeight, that means there is a break in the lines - pushes all elements inbetween startOfLineIdx and the linebreak (the line) 
            if (topOfWordDifferences[i] > lineHeightOfPreviousWord) {

                linesInParagraph.push(
                    spansInParagraph.slice(startOfLineIdx, i)
                );

                startOfLineIdx = i;

            }

        }

        linesInParagraph.push(
            spansInParagraph.slice(startOfLineIdx, topOfWordDifferences.length)
        );

    }

    /* eventually will be highlighting individual lines - keeping it simple for testing */
    const highlightEntireParagraph = () => {

        $(paragraph).find("span.whitespace, span.word").addClass("highlighted");

    }

    const removeHighlight = () => {

        $(paragraph).find("span.whitespace, span.word").removeClass("highlighted");

    }

    // export functions that we want available
    return {

        splitIntoSpans,
        calculateLines,
        highlightEntireParagraph,
        removeHighlight

    }

}