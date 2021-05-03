// controller for the entire program 
// where we can start and stop highlighting/the entire program
// should movement of the line be in here or in ParagraphController?
class OneLine {

    static start(paragraphController) {

        paragraphController.populateRelevantParagraphArray();

        paragraphController.createParagraph();

        paragraphController.beginHighlighting();

    }

    static stop() {
        // whatever we need to do to stop OneLine
    }

}
