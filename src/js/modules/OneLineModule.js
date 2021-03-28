/*
 - Module to perform basic functions of OneLine
 - Can start and stop the highlighting of the program
 - Controls TTS?
*/

const OneLineModule = (paragraphController) => {

    const start = () => {

        paragraphController.populateRelevantParagraphArray();

        paragraphController.createParagraph();

        paragraphController.beginHighlighting();

    }

    const stop = () => {

        console.log("stopping");

    }

    return {

        start,
        stop

    }

}