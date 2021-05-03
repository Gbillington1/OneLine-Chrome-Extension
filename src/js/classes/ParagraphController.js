// where we are going to populate and navigate through all relevant paragraphs
// create new paragraphs
class ParagraphController {

    constructor() {
        this.allRelevantParagraphs = []; // array of jquery objects 
        this.paragraphs = [] // array of Paragraph objects
        this.currentParagraphIndex = 0; // tracks the paragraph that the highlighted line is in
        this.paragraphObjectIndex = 0; // tracks paragraphs that have been created + added to paragraphs array
    }

    // needs to be enhaced to filter out the irrelevant paragraphs (paras that we don't want to highlight)
    populateRelevantParagraphArray() {

        this.allRelevantParagraphs = $("p:visible").not("header p, footer p");

    }

    /* 
     - Creates a new Paragraph object, and adds it to this.paragraphs.
     - Only adds the paragraph if it hasn't already in this.paragraphs
    */
    createParagraph() {

        // if paragraph hasn't been added to this.paragraphs yet
        if (this.currentParagraphIndex == this.paragraphObjectIndex) {

            // add new paragraph to array
            this.paragraphs.push(

                new Paragraph(this.allRelevantParagraphs[this.paragraphObjectIndex])

            );

        }

        console.log(this.paragraphs);

    }

    beginHighlighting() {

        this.paragraphs[this.currentParagraphIndex].splitIntoSpans();
        this.paragraphs[this.currentParagraphIndex].highlightEntireParagraph();

    }

    // clean up
    moveParagraph(e) {

        // if W key is pressed
        if (e.keyCode == 87 && this.currentParagraphIndex > 0) {

            this.paragraphs[this.currentParagraphIndex].removeHighlight();
            // remove the highlight
            this.currentParagraphIndex--;
            this.paragraphs[this.currentParagraphIndex].splitIntoSpans();
            this.paragraphs[this.currentParagraphIndex].highlightEntireParagraph();

            // if S key is pressed
        } else if (e.keyCode == 83 && (this.currentParagraphIndex < this.allRelevantParagraphs.length - 1)) {

            this.paragraphs[this.currentParagraphIndex].removeHighlight();
            this.currentParagraphIndex++;
            this.paragraphObjectIndex++; 
            this.createParagraph();
            this.paragraphs[this.currentParagraphIndex].splitIntoSpans();
            this.paragraphs[this.currentParagraphIndex].highlightEntireParagraph();

        }
        console.log("Current paragraph idx: " + this.currentParagraphIndex);
        
    }

}