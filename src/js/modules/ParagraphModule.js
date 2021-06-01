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
    let topOfSpanDifferences = [0];

    /* array of Line modules (eventually), currently its a 2d array of span elems */ 
    let linesInParagraph = [];

    let currentLineIdx = 0;

    /* Module fucntions */

    const splitIntoSpans = () => {

        Splitting({ target: paragraph, by: "paragraphSplitPlugin" })
        // copy all "spannified" words into array
        spansInParagraph = $(paragraph).find("span.word, span.whitespace");

    }

    /*
     - Calls the necessary functions to break a paragraph into LineModules
    */
    const calculateLines = () => {

        populateDifferencesArray();

        populateLineModuleArray();

    }

    /*
     - Populates an array (topOfSpanDifferences) with numbers that represent the difference between the offset top of the current span element and the offset top of the previous span element
     - Offset top is the distance from the top of the page to the top of the span element 
     - topOfSpanDifferences starts at idx 1 because the loop needs to start at 1, and the arr needs to be the same length as spansInParagraph
    */
    const populateDifferencesArray = () => {

        for (let i = 1; i < spansInParagraph.length; i++) {

            let currentSpanOffsetTop = $(spansInParagraph[i]).offset().top;
            let previousSpanOffsetTop = $(spansInParagraph[i - 1]).offset().top;


            topOfSpanDifferences.push(
                Math.round(currentSpanOffsetTop - previousSpanOffsetTop)
            );
        }

    }

    /*
     - Uses the differences array to check for line breaks
     - There is a line break if the difference is larger than the line height
     - Using startOfLineIdx to track the first word in every line, all elements between that index and the index where the line breaks is a line
     - Creates a LineModule for each line, and adds it to linesInParagraph
    */
    const populateLineModuleArray = () => {

        let startOfLineIdx = 0; // used to keep track of the first word in a line
        let lineHeightOfPreviousWord = 0;

        // use differences array to find all of the lines in the paragraph
        for (let i = 0; i < topOfSpanDifferences.length; i++) {

            if (i > 0) {
                lineHeightOfPreviousWord = $(spansInParagraph[i - 1]).outerHeight();
            }

            // if there is a difference that is bigger than the lineHeight, that means there is a break in the lines - pushes all elements inbetween startOfLineIdx and the linebreak (the line) 
            if (topOfSpanDifferences[i] > lineHeightOfPreviousWord) {

                linesInParagraph.push(
                    LineModule(spansInParagraph.slice(startOfLineIdx, i))
                );

                startOfLineIdx = i;

            }

        }

        // account for the last line in the paragraph
        linesInParagraph.push(
            LineModule(spansInParagraph.slice(startOfLineIdx, topOfSpanDifferences.length))
        );

    }

    const isLineInViewport = () => {

        const topOfViewport = $(window).scrollTop();
        const bottomOfViewport = $(window).scrollTop() + window.innerHeight;
        const line = $("span.highlighted");
        const topOfLine = line.offset().top;
        const bottomOfLine = line.offset().top + line.outerHeight();
    
        if (bottomOfLine < topOfViewport || topOfLine > bottomOfViewport) {
            return false; 
        }
    
        return true; 
    } 

    const updateHighlight = (currentLineTracker, e) => {

        removeAllHighlights();

        // console.log(currentLineTracker, linesInParagraph[currentLineTracker])

        linesInParagraph[currentLineTracker].highlightLine();
        currentLineIdx = currentLineTracker;

        console.log(isLineInViewport());

        // scroll option 1
        if (!isLineInViewport()) {
            $("span.highlighted")[0].scrollIntoView({ behavior: "smooth", block: "center" })
        }

        // scroll option 2
        // $("span.highlighted")[0].scrollIntoView({ behavior: "smooth", block: "center" }) 
    }

    const removeAllHighlights = () => {

        $(paragraph).find("span.word.highlighted, span.whitespace.highlighted").removeClass("highlighted");

    }

    const getNumberOfLines = () => {

        return linesInParagraph.length - 1;

    }

    // export functions that we want available
    return {

        paragraph,
        linesInParagraph,
        currentLineIdx,
        splitIntoSpans,
        calculateLines,
        updateHighlight,
        removeAllHighlights,
        getNumberOfLines

    }

}