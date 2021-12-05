/*
 - Manages all paragraphs (ParagraphModules) on a the webpage
 - Retrieves and navigates through all relevant paragraphs
*/
const ParagraphControllerModule = () => {

    /* Global Variables */

    /* Arrays */
    // Array of jQuery paragraph objects that pass the isValidParagraph function 
    let relevantParagraphs = [];

    /* Array of Paragraph modules that are able to be highlighted */
    let paragraphs = [];

    /* Indices */
    // tracks the paragraph that highlighted line is in
    let currentParagraphTracker = 0;

    /*
     - tracks the most recent paragraph that has been created
     - helps identify which paragraphs haven't been manipulated or added to paragraphs array
     - is 0 when first para has been created, 1 when second para, etc
    */
    let mostRecentParagraphTracker = 0;

    /*
     - Tracks the highlighted line in the paragraph 
     - Never larger than paragraph.getNumberOfLines()
    */
    let currentLineTracker = 0;

    /* Checks if the given paragraph is valid by checking the number of spaces and the number of periods */
    const isValidParagraph = (paragraph) => {

        let paragraphText = paragraph.innerText;

        if (paragraphText && paragraphText.length > 0) {

            // sometimes the regex returns null, ?? [] is a workaround for that
            let numberOfSpaces = (paragraphText.match(/\s/g) ?? []).length;

            // selects punctuation that comes after a word
            let numberOfPunctuations = (paragraphText.match(/(?<=\w)[^\w\s]/g) ?? []).length;

            if (numberOfSpaces >= 5 || numberOfPunctuations >= 1) {
                return true;
            } else {
                return false;
            }

        }


    }

    /* 
     - Handles logic to only add relevant paragraphs to paragraphs array
     - it works for now, but it would be nice if it could be enhanced more
        - Highlight ordered and unordered lists that are in the article (not on the sidebar or anything) 
    */
    const populateRelevantParagraphArray = () => {

        /* Get the element that contains all of the main content
            - select the <main> tag (works for some. NYTimes has main with <article> embeded)
            - select the <article> tag (works for some articles, like the WSJ)
            - select element with the id of "content" or "main-conent" (works on some, like wikipedia)
            - there is probably more, I just don't know how to find them
        */


        // search that element for elements with a certain text to all content ratio (see https://www.practicallinguist.com/lte-extracting-relevant-text-and-features-from-html/)

        // filter out any mistakes

        // populate array with that nodelist

        // Other solution
        /* .
            - Select all elements with n number of words, and 1 item of punctuation (figure out what the minimum sentence requirements are)
            - Get the link to text ratio of those elements to determine what is text content and what is irrelevant (like a navbar)
            - check that ratio against some threshold to get relevant elements
            - split and highlight those elements
        */

        // current workaround
        let potentialParagraphs = $("p:visible").not("header p, footer p");

        potentialParagraphs.each((i, para) => {

            // check if paragraph a valid piece of text
            // this requires a # of spaces and # of punctuation threshhold - is it worth it? 
            if (isValidParagraph(para)) {
                relevantParagraphs.push(para);
            }

        })

        // let bodyChildren = $("body").children().not("header, footer, script, noscript");
        // // console.log(bodyChildren);

        // let longestChildLength = 0;
        // let longestChild;

        // // search for child with most text inside of it 
        // bodyChildren.each((i, elem) => {

        //     let childLength = elem.innerText.length;

        //     if (childLength > longestChildLength) {
        //         longestChildLength = childLength;
        //         longestChild = elem;
        //     }

        // })

        // console.log(longestChildLength, longestChild);

        // let mainContentContainer;
        // if ($("main").length > 0) {
        //     mainContentContainer = $("main");
        // } else if ($("article").length > 0) {
        //     mainContentContainer = $("article");
        // }
        // console.log(mainContentContainer)

    }

    /* 
     - Creates a new Paragraph module, and adds it to paragraphs.
     - Splits paragraph into lines after it's added
    */
    const createOneLineParagraph = () => {

        // add new paragraph module to array
        const currentParagraph = ParagraphModule(relevantParagraphs[mostRecentParagraphTracker]);

        paragraphs.push(currentParagraph);

        currentParagraph.splitIntoSpans();
        currentParagraph.calculateLines();

    }

    /*
     - Calls necessary functions to start highlighting the line (in this case the paragraph)
    */
    const beginHighlighting = () => {

        paragraphs[currentParagraphTracker].updateHighlight(currentLineTracker);

    }


    // line movement functions
    // TODO: Allow users to bind the line moving keys to anyone they want
    /* 
    - Handles logic for moving the highlighted line up
    - Fires when "W" or up arrow is pressed
    */
    const moveLineUp = () => {
        // check if line is first in paragrph
        // if it isn't, move line up
        // if it is, check if paragraph is first in page
        // then move paragraph track up and highlight last in new paragraph

        // if line is not first in paragraph
        if (currentLineTracker > 0) {

            paragraphs[currentParagraphTracker].removeAllHighlights(currentLineTracker);
            currentLineTracker--;
            paragraphs[currentParagraphTracker].updateHighlight(currentLineTracker);

            // if line is first in paragraph and paragraph is not first in page
        } else if (currentParagraphTracker > 0) {

            paragraphs[currentParagraphTracker].removeAllHighlights(currentLineTracker);

            currentParagraphTracker--;

            currentLineTracker = paragraphs[currentParagraphTracker].getNumberOfLines();
            paragraphs[currentParagraphTracker].updateHighlight(currentLineTracker);

        }

    }

    /* 
    - Handles logic for moving the highlighted line down
    - Fires when "S" or down arrow is pressed
    */
    const moveLineDown = () => {
        // check if line is last in paragraph
        // if it isn't, move line down
        // if it is, check if paragraph is last in page
        // then move paragraph track down and highlight first in new paragraph

        // if line is not last in paragraph
        if (currentLineTracker < paragraphs[currentParagraphTracker].getNumberOfLines()) {

            paragraphs[currentParagraphTracker].removeAllHighlights(currentLineTracker);
            currentLineTracker++;
            paragraphs[currentParagraphTracker].updateHighlight(currentLineTracker);

            // if line is last in paragraph and paragraph is not last in page   
        } else if (currentParagraphTracker < relevantParagraphs.length - 1) {

            // if next paragraph hasn't been created as a module
            if (currentParagraphTracker == mostRecentParagraphTracker) {
                mostRecentParagraphTracker++;
                createOneLineParagraph();
            }

            paragraphs[currentParagraphTracker].removeAllHighlights(currentLineTracker);

            currentParagraphTracker++;
            currentLineTracker = 0;

            paragraphs[currentParagraphTracker].updateHighlight(currentLineTracker);

        }

    }

    const removeHighlightFromParagraphs = () => {
        paragraphs[currentParagraphTracker].removeAllHighlights(currentLineTracker);
    }

    return {

        populateRelevantParagraphArray,
        createOneLineParagraph,
        beginHighlighting,
        removeHighlightFromParagraphs,
        moveLineUp,
        moveLineDown

    }


}