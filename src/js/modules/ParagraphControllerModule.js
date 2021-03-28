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
    let currentParagraphIndex = 0;

    // tracks the paragraphs that have been created + added to the paragraph array
    let paragraphObjectIndex = 0; 

    /* 
     - Needs to be enhaced to filter out the irrelevant paragraphs (paras that we don't want to highlight)
    */
    const populateRelevantParagraphArray = () => {

        allRelevantParagraphs = $("p:visible").not("header p, footer p");

    }

    /* 
     - Creates a new Paragraph module, and adds it to paragraphs.
     - Only adds the paragraph if it hasn't already in paragraphs
    */
    const createParagraph = () => {

        // if paragraph hasn't been added to paragraphs yet
        if (currentParagraphIndex == paragraphObjectIndex) {

            // add new paragraph module to array
            paragraphs.push(

                ParagraphModule(allRelevantParagraphs[paragraphObjectIndex])

            );

        }

        console.log(paragraphs);

    }

    /*
     - Calls necessary functions to start highlighting the line (in this case the paragraph)
    */
    const beginHighlighting = () => {

        paragraphs[currentParagraphIndex].splitIntoSpans();
        paragraphs[currentParagraphIndex].highlightEntireParagraph(); // should be individual line

    }

    /* 
     - Handles logic for moving the highlighted paragraph up and down
     - Needs to be split up into different functions
     - Add arrow key functionality 
    */
    const moveParagraph = (e) => {

        // if W key is pressed
        if (e.keyCode == 87 && currentParagraphIndex > 0) {

            paragraphs[currentParagraphIndex].removeHighlight();
            // remove the highlight
            currentParagraphIndex--;
            paragraphs[currentParagraphIndex].splitIntoSpans();
            paragraphs[currentParagraphIndex].highlightEntireParagraph();

            // if S key is pressed
        } else if (e.keyCode == 83 && (currentParagraphIndex < allRelevantParagraphs.length - 1)) {

            paragraphs[currentParagraphIndex].removeHighlight();
            currentParagraphIndex++;
            paragraphObjectIndex++; 
            createParagraph();
            paragraphs[currentParagraphIndex].splitIntoSpans();
            paragraphs[currentParagraphIndex].highlightEntireParagraph();

        }

        console.log("Current paragraph idx: " + currentParagraphIndex);

    }

    return {

        populateRelevantParagraphArray,
        createParagraph,
        beginHighlighting,
        moveParagraph

    }


}