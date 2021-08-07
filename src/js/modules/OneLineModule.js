/*
 - Module to perform basic functions of OneLine
 - Can start and stop the highlighting of the program
 - Controls TTS?
*/

const OneLineModule = (paragraphController) => {

    const start = () => {

        // ToDo: Make sure that the necessary functions run when start() is called for a second time on the same page

        paragraphController.populateRelevantParagraphArray();

        paragraphController.createParagraph();

        paragraphController.beginHighlighting();

    }

    const stop = () => {

        //ToDo: write functions/find functions to stop the program

    }

    return {

        start,
        stop

    }

}