/*
 - Manages all paragraphs (ParagraphModules) on a the webpage
 - Retrieves and navigates through all relevant paragraphs
*/
const ParagraphControllerModule = () => {

    /* Global Variables */

    /* Arrays */
    // Array of jQuery paragraph objects 
    let relevantParagraphs = [];

    /* Array of Paragraph modules */
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
     - Never larger than the # of lines in the paragraph - 1
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
    const createParagraph = () => {

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

        paragraphs[currentParagraphTracker].updateHighlight(0); 

    }

    /* 
     - Handles logic for moving the highlighted line up and down
     - Allow users to bind the line moving key to anyone they want
    */
    const moveParagraph = (e) => {

        // if line in moving UP
        // if W key is pressed && current paragraph is not the 1st paragraph on page
        if (e.keyCode == 87 && currentParagraphTracker >= 0) {

            // moving line UP when there is a line in the same paragraph above it (doesn't have to switch paragraphs)
            if (currentLineTracker > 0) {

                currentLineTracker--; 
                paragraphs[currentParagraphTracker].updateHighlight(currentLineTracker);

            // moving line UP when there isn't a line in the same para above it (has to switch paragraphs)
            } else if (currentLineTracker == 0 && currentParagraphTracker > 0) {

                paragraphs[currentParagraphTracker].removeAllHighlights();

                currentParagraphTracker--;
                
                currentLineTracker = paragraphs[currentParagraphTracker].getNumberOfLines();
                paragraphs[currentParagraphTracker].updateHighlight(currentLineTracker);

            }

            // if line is moving DOWN
            // if S key is pressed and current paragraph is not the last paragraph on page
        } else if (e.keyCode == 83 && (currentParagraphTracker < relevantParagraphs.length - 1)) {

            // moving line down when there is a line in the same para below it
            if (currentLineTracker < paragraphs[currentParagraphTracker].getNumberOfLines()) {

                currentLineTracker++;
                paragraphs[currentParagraphTracker].updateHighlight(currentLineTracker);

            // moving line down when there isn't a line in the same para below it (has to switch paragraphs)
            } else if (currentLineTracker == paragraphs[currentParagraphTracker].getNumberOfLines() && 
                currentParagraphTracker < relevantParagraphs.length - 1) {

                currentLineTracker = 0;

                mostRecentParagraphTracker++;
                createParagraph();

                paragraphs[currentParagraphTracker].removeAllHighlights();
                currentParagraphTracker++;
                paragraphs[currentParagraphTracker].updateHighlight(currentLineTracker);

            }

        }


    }

    return {

        populateRelevantParagraphArray,
        createParagraph,
        beginHighlighting,
        moveParagraph,

    }


}