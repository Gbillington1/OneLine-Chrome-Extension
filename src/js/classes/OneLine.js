/*
 - Module to perform basic functions of OneLine
 - Can start and stop the highlighting of the program
 - Controls TTS?
*/

class OneLine {

    // private instance variables
    #paragraphController;
    #oneLineHasStarted;

    constructor() {
        this.#paragraphController = new ParagraphController();
        this.oneLineHasStarted = false;
    }

    start(paragraphController) {

        // ToDo: Make sure that the necessary functions run when start() is called for a second time on the same page


        if (!this.oneLineHasStarted) {

            this.#paragraphController.populateRelevantParagraphArray();

            this.#paragraphController.createOneLineParagraph();

            this.oneLineHasStarted = true;

        }

        // this.#paragraphController.beginHighlighting();
        this.#paragraphController.currentParagraph.currentLine.highlight();

    }

    stop() {
        //ToDo: write functions/find functions to stop the program
        this.#paragraphController.currentParagraph.currentLine.removeHighlight();
    }

    moveLine(direction) {

        if (direction == 'up') {

            this.#paragraphController.moveLineUp();

            // s or down arrow pressed
        } else if (direction == 'down') {

            this.#paragraphController.moveLineDown();

        }

    }

    // need a better way to update colors and highlighting
    changeLineColor(newColor) {

        this.#paragraphController.currentParagraph.currentLine.setColor(newColor);

        this.#paragraphController.currentParagraph.currentLine.highlight();

    }

}
