/* 
 - Manipulates the given paragraph
 - Splits paragraph into span elements
 - Highlights all span elements
*/
import $ from 'jquery';
import Line from './Line';
import Splitting from "splitting";
import { splitText } from '../utils/splittingUtils';

const Paragraph = function Paragraph(paragraph) {

    /* Global Variables */

    /* array of all span elements containing words/special chars in the paragraph */
    let spansInParagraph;

    /* 
     - array of value (in px) of current word distance from top of page
       to previous word distance from top of page 
     - added 0 to first element to length would match spansInParagraph.lenght (see calculate lines)
    */
    let topOfSpanDifferences = [0];

    /* array of Line s (eventually), currently its a 2d array of span elems */ 
    let linesInParagraph = [];

    let currentLineIdx = 0;

    /*  fucntions */

    const splitIntoSpans = () => {

        if (spansInParagraph === undefined) {
            // add custom splitting plugin
            Splitting.add({
                by: "OneLineParagraphSplitPlugin",
                key: "word",
                depends: 0,
                split: function(el) {
                    return splitText(el, "word", /(\s|\-|\—)/g, 0, 0)
                }
            })
            Splitting({ target: paragraph, by: "OneLineParagraphSplitPlugin" })

            // copy all "spannified" words into array
            spansInParagraph = $(paragraph).find("span.word:not(style *), span.whitespace:not(style *)");
        }

    }

    /*
     - Calls the necessary functions to break a paragraph into Lines
    */
    const calculateLines = () => {

        topOfSpanDifferences = [0]
        linesInParagraph = [];
        currentLineIdx = 0;

        // if turning abionic off, remove all spans and resplit into spans (removing <b> tags messes with span formatting)
        spansInParagraph = $(paragraph).find("span.word:not(style *), span.whitespace:not(style *)");

        populateDifferencesArray();

        populateLineArray();

    }

    /*
     - Populates an array (topOfSpanDifferences) with numbers that represent the difference between the offset top of the current span element and the offset top of the previous span element
     - Offset top is the distance from the top of the page to the top of the span element 
     - topOfSpanDifferences starts at idx 1 because the loop needs to start at 1 to get the offset top of the previous span (can't get previous element when at idx 0), and the arr needs to be the same length as spansInParagraph
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
     - There is a line break if the difference is >= the line height
     - Using startOfLineIdx to track the first word in every line, all elements between that index, and the index where the line breaks, is a line
     - Creates a Line for each line, and adds it to linesInParagraph
    */
    const populateLineArray = () => {

        let startOfLineIdx = 0; // used to keep track of the first word in a line
        let lineHeightOfPreviousWord = 0;
        let distanceFromLineHeight;

        // use differences array to find all of the lines in the paragraph
        for (let i = 1; i < topOfSpanDifferences.length; i++) {

            lineHeightOfPreviousWord = $(spansInParagraph[i - 1]).outerHeight();
            distanceFromLineHeight = Math.abs(topOfSpanDifferences[i] - lineHeightOfPreviousWord);

            // if there is a difference that is >= the lineHeight, that means there is a break in the lines - pushes all elements inbetween startOfLineIdx and the linebreak (the line) 
            if (topOfSpanDifferences[i] >= lineHeightOfPreviousWord || distanceFromLineHeight <= 5) {

                linesInParagraph.push(
                    Line(spansInParagraph.slice(startOfLineIdx, i))
                );

                startOfLineIdx = i;

            }

        }

        // account for the last line in the paragraph
        linesInParagraph.push(
            Line(spansInParagraph.slice(startOfLineIdx, topOfSpanDifferences.length))
        );

    }

    const updateHighlight = (currentLineTracker) => {

        removeAllHighlights(currentLineTracker);

        linesInParagraph[currentLineTracker].highlightLine();
        currentLineIdx = currentLineTracker
        
    }

    // make change this function to access the line ? The problem might stem from the `moveParagraph()` funciton
    const removeAllHighlights = (currentLineTracker) => {
        linesInParagraph[currentLineTracker].removeHighlightFromLine();
    }

    const getNumberOfLines = () => {
        return linesInParagraph.length - 1;
    }

    const clear = () => {

        // clear paragraph classes and styles from splitting plugin
        // $(paragraph).removeClass("paragraphSplitPlugin splitting")
        // if ($(paragraph).classList === undefined || $(paragraph).classList.length === 0) {
        //     $(paragraph).removeAttr("class");
        // }

        // let styleString = $(paragraph).attr("style");
        // let preIndex = styleString.indexOf("--word-total:");
        // let searchIndex = preIndex + styleString.substring(preIndex).indexOf(";");
        // let newStyleString = styleString.substring(0, preIndex) + styleString.substring(searchIndex + 1);
        // $(paragraph).attr("style", newStyleString);
        // if (newStyleString.length > 0) {
        // } else {
        //     $(paragraph).removeAttr("style");
        // }

        // remove all spans
        for (let i = 0; i < spansInParagraph.length; i++) { 
            let s = $(spansInParagraph[i]);           
            s.replaceWith(s.text());
        }

        // merge all text nodes into one
        let mergedText = "";
        paragraph.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                mergedText += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                mergedText += node.outerHTML;
            }
        })
        paragraph.innerHTML = mergedText;

        // reset variables
        spansInParagraph = undefined;
        topOfSpanDifferences = [0];
        linesInParagraph = [];
        currentLineIdx = 0;
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
        getNumberOfLines,
        clear
    }
}
export default Paragraph;