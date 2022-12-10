/*
 - Module to perform basic functions of OneLine
 - Can start and stop the highlighting of the program
 - Controls TTS?
*/

const OneLineModule = () => {

    const paragraphController = ParagraphControllerModule();
    let oneLineHasStarted = false;

    const start = () => {

        if (!oneLineHasStarted) {

            paragraphController.populateRelevantParagraphArray();

            paragraphController.createOneLineParagraph();

            oneLineHasStarted = true;

        }

        paragraphController.beginHighlighting();

    }

    // need solution for turning off the highlighting when user switches tabs
    const stop = () => {
        if (oneLineHasStarted) {
            paragraphController.removeHighlightFromParagraphs();
            oneLineHasStarted = false;
        }

    }

    const refresh = () => {
        paragraphController.resetController();
        paragraphController.populateRelevantParagraphArray();
        paragraphController.createOneLineParagraph();
        oneLineHasStarted = true;
    }

    const moveLine = (direction) => {

        // w or up arrow pressed
        if (direction == 'up') {

            paragraphController.moveLineUp();

        // s or down arrow pressed
        } else if (direction == 'down') {

            paragraphController.moveLineDown();

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
        refresh,
        moveLine

    }

}