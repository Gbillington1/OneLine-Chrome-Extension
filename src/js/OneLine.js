// controller for the entire program 
// where we can start and stop highlighting/the entire program
// should movement of the line be in here or in ParagraphController?
class OneLine {

    static start(paragraphController) {

        // get relevant paragraphs from ParagraphController class
        paragraphController.populateRelevantParagraphArray();
        console.log(paragraphController.allRelevantParagraphs);
        paragraphController.createParagraph(); 
        paragraphController.beginHighlighting();

    }

    static stop() {
        // whatever we need to do to stop OneLine
    }

}
