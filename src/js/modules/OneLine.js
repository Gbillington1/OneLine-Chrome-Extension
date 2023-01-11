/*
 - Module to perform basic functions of OneLine
 - Can start and stop the highlighting of the program
 - Controls TTS?
*/

const OneLine = () => {

    const paragraphController = ParagraphController();
    let running = false;

    const start = () => {
        if ($('span.word span.whitespace').length === 0) {

            let result = paragraphController.populateRelevantParagraphArray();

            // if result is -1, then there are no paragraphs on the page
            // notify user
            if (result === -1) {
                // ideally show a popup that allows users to input if this is a mistake, or if there is an issue with this page (sort of like a report bug button)
            };

            paragraphController.createOneLineParagraph();

            running = true;

        }

        paragraphController.beginHighlighting();

    }

    const stop = () => {
        if (running) {
            paragraphController.removeHighlightFromParagraphs();
        }
        running = false;
    }

    const resize = () => {
        paragraphController.removeHighlightFromParagraphs();
        paragraphController.refreshLines();
        paragraphController.beginHighlighting();
    }

    const moveLine = (direction) => {

        // w or up arrow pressed
        if (direction == 'up') {

            paragraphController.moveLineUp();

        // s or down arrow pressed
        } else if (direction == 'down') {

            paragraphController.moveLineDown();

        }

        // if line is not in viewport, scroll to line
        // want to control scrolling from here, so that auto scroll kicks in when user gives an input, NOT when the page loads (causing unwanted scrolling)
        if (!paragraphController.isLineVisibleInViewport()) {
            $("span.highlighted")[0].scrollIntoView({ behavior: "smooth", block: "center" })
        }

    }

    /*
    TODO: Should I add some type of TTS controller that can do all of this? Think about the best way to implement this feature.

    - Function to start the TTS
    - Accesses paragraphController that contains another TTS function
        - This function will feed each line into the Utterance instance and probably call another function to move the line down the screen

    - Function to stop the TTS
    - Somehow accesses the Utterance instance and calls the stop() function

    - Function to toggle play/pause of TTS
    - Access the Utterance instance and call the pause() and resume() functions
    */

    return {

        start,
        stop,
        resize,
        moveLine

    }

}