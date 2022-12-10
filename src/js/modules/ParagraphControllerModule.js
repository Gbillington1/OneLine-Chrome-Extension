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

    // keeping it simple for now, just making sure paragraphs have text in them
    const isValidParagraph = (paragraph) => {

        let paragraphText = $(paragraph).text();
        if (paragraphText && paragraphText.length > 0) {
            return true;
        } 

        return false;
    }

    /* 
     - Handles logic to only add relevant paragraphs to paragraphs array
     - checks for <main> or <article> and searches in those for text elements, then checks if they are valid
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




        /* BRO JUST MAKE A MENU SO THE USER CAN SELECT WHICH TEXT ELEMENTS THEY WANT TO HIGHLIGHT
            - Headings (H1, H2, H3, H4, H5, H6)
            - Paragraphs
            - Lists (ol, ul) (will have to filter out lists not in the article/content)
            - Code blocks (pre, code)
            - Tables (table, tr, td, th) (??)
        */


        
        // rough psudo for getting more than paragraphs
        // look for <article> tag
            // if found search for all <p>, <ul>, <ol>, <h1>, <h2>, <h3>, <h4>, <h5>, <h6> tags (maybe more??)
            // parse all tags and attempt to split them into lines (or sentences for another mode)
        // if not found, search for <main> tag
            // if found search for all <p>, <ul>, <ol>, <h1>, <h2>, <h3>, <h4>, <h5>, <h6> tags (maybe more??)
            // parse all tags and attempt to split them into lines (or sentences for another mode)
        // if not found get all <p> tags
            // apply current paragraph filter to the <p> tags

        let potentialParagraphs = [];
        relevantParagraphs = [];
        if ($("article").length > 0) {
            potentialParagraphs = $("article").find("p:visible, h1:visible, h2:visible, h3:visible, h4:visible, h5:visible, h6:visible").not("header p, footer p");
        } else if ($("main").length > 0) {
            potentialParagraphs = $("main").find("p:visible, h1:visible, h2:visible, h3:visible, h4:visible, h5:visible, h6:visible").not("header p, footer p");
        } else {
            potentialParagraphs = $("p:visible, h1:visible, h2:visible, h3:visible, h4:visible, h5:visible, h6:visible").not("header p, footer p");
        }

        potentialParagraphs.each((i, elem) => {

            // checks if the paragraph has text
            if (isValidParagraph(elem)) {
                relevantParagraphs.push(elem);
            }

        })
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

    const resetController = () => {
        paragraphs = [];
        relevantParagraphs = [];
        currentParagraphTracker = 0;
        mostRecentParagraphTracker = 0;
        currentLineTracker = 0;
    }

    return {

        populateRelevantParagraphArray,
        createOneLineParagraph,
        beginHighlighting,
        removeHighlightFromParagraphs,
        moveLineUp,
        moveLineDown,
        resetController

    }


}