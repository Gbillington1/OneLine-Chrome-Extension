/*
 - Module to perform basic functions of OneLine
 - Can start and stop the highlighting of the program
 - Controls TTS?
*/

const OneLineModule = (paragraphController) => {

    let oneLineHasStarted = false;

    const start = () => {

        // ToDo: Make sure that the necessary functions run when start() is called for a second time on the same page

        if (!oneLineHasStarted) {

            paragraphController.populateRelevantParagraphArray();

            paragraphController.createOneLineParagraph();

            oneLineHasStarted = true;

        }

        paragraphController.beginHighlighting();

    }

    const stop = () => {

        //ToDo: write functions/find functions to stop the program
        paragraphController.removeHighlightFromParagraphs()

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
        stop

    }

}