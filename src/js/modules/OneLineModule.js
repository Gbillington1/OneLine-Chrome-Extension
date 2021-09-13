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

    return {

        start,
        stop

    }

}