let currentParagraphIndex = 0;
let paragraphArray = []; // array of Paragraph objects
let allRelevantParagraphs; // array of relevant jQuery paragraph objects

window.onload = () => {

    startOneLine(); // is this ok? The function doesn't really explain much

    // wrapWordsInParagraphWithSpanTags(paragraphs);

    // findOffsetsForEveryWordInParagraph();

    // highlightLine(); 

    $(document).keydown(moveLineOnKeydown);

}

// calls necessary funcitons to highlight the first line
function startOneLine() {

    // getParagraphs() needs to be enhanced to only select relevant paragraphs
    allRelevantParagraphs = getParagraphs();

    createParagraph(allRelevantParagraphs[0]);

    paragraphArray[currentParagraphIndex].splitIntoSpans();
    paragraphArray[currentParagraphIndex].highlightEntireParagraph(); // for testing
    paragraphArray[currentParagraphIndex].calculateLines();

}

function createParagraph(paragraph) {
    paragraphArray.push(new Paragraph(paragraph));
}

// logic for moving the line throughout the page
function moveLineOnKeydown(e) {
    // if W key is pressed
    if (e.keyCode == 87 && currentParagraphIndex > 0) {

        paragraphArray[currentParagraphIndex].removeHighlight();
        currentParagraphIndex--;

        // if S key is pressed
    } else if (e.keyCode == 83 && currentParagraphIndex < allRelevantParagraphs.length - 1) {

        currentParagraphIndex++;
        createParagraph(allRelevantParagraphs[currentParagraphIndex]);
        paragraphArray[currentParagraphIndex].splitIntoSpans();
        paragraphArray[currentParagraphIndex].highlightEntireParagraph();

    }
    console.log("Current paragraph idx: " + currentParagraphIndex);
}


