/*
 - Manages all paragraphs (ParagraphModules) on a the webpage
 - Retrieves and navigates through all relevant paragraphs
*/
const ParagraphControllerModule = () => {

    /* Global Variables */

    /* Arrays */
    // Array of jQuery paragraph objects 
    let allRelevantParagraphs = [];

    /* Array of Paragraph modules */
    let paragraphs = [];

    /* Indices */
    // tracks the paragraph that highlighted line is in
    let currentParagraphTracker = 0;

    /*
     - tracks the most recent paragraph that has been created
     - helps identify which paragraphs haven't been manipulated or added to paragraphs array
    */
    let mostRecentParagraphTracker = 0;

    /* 
     - Needs to be enhaced to filter out the irrelevant paragraphs (paras that we don't want to highlight)
    */
    const populateRelevantParagraphArray = () => {

        allRelevantParagraphs = $("p:visible").not("header p, footer p");

    }

    /* 
     - Creates a new Paragraph module, and adds it to paragraphs.
     - Only adds the paragraph if it hasn't already been added to paragraphs
    */
    const createParagraph = () => {

        // add new paragraph module to array
        paragraphs.push(

            ParagraphModule(allRelevantParagraphs[mostRecentParagraphTracker])

        );

        console.log(paragraphs);

    }

    /*
     - Calls necessary functions to start highlighting the line (in this case the paragraph)
    */
    const beginHighlighting = () => {

        paragraphs[currentParagraphTracker].splitIntoSpans();
        paragraphs[currentParagraphTracker].highlightEntireParagraph(); // should be individual line

    }

    /* 
     - Handles logic for moving the highlighted paragraph up and down
     - Needs to be split up into different functions
     - Add arrow key functionality 
    */
    const moveParagraph = (e) => {

        // if W key is pressed
        if (e.keyCode == 87 && currentParagraphTracker > 0) {

            moveLineUp();

            // if S key is pressed
        } else if (e.keyCode == 83 && (currentParagraphTracker < allRelevantParagraphs.length - 1)) {

            moveLineDown();

        }

        console.log("Current paragraph idx: " + currentParagraphTracker);

    }

    /*
     - Performs necessary functions and mutations to move the line up 1 index
    */
    const moveLineUp = () => {

        paragraphs[currentParagraphTracker].removeHighlight();

        currentParagraphTracker--;

        paragraphs[currentParagraphTracker].highlightEntireParagraph();

    }

    /*
     - Performs necessary functions, checks, and mutations to move the line down 1 index
    */
    const moveLineDown = () => {

        paragraphs[currentParagraphTracker].removeHighlight();

        // checks if the next paragraph hasn't been created as a module yet
        if (currentParagraphTracker == mostRecentParagraphTracker) {

            mostRecentParagraphTracker++;

            createParagraph();

            paragraphs[mostRecentParagraphTracker].splitIntoSpans();

        }

        currentParagraphTracker++;

        paragraphs[currentParagraphTracker].highlightEntireParagraph();

    }

    return {

        populateRelevantParagraphArray,
        createParagraph,
        beginHighlighting,
        moveParagraph

    }


}