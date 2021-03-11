const wrapWordsInParagraphWithSpanTags = (paragraphs) => {

    // paragraph object in this file or in OneLine.js?


    // currentParagraph.split();



    // let words = getWordsInSpanTags(paragraphs);

}

// algorithm to form arrays of offsets to be used in the highlighting algorithm
const findOffsetsForEveryWordInParagraph = () => {

    // is there a better way to do this? Simpler and more efficient? 

    // loop #1 - loop through words in span tags
    /* 
     - calculate offset from the top and bottom of the current word to the top of the page
     - calculate the difference between the top of the current word and the top of the 
       previous word (used to detect line breaks and other irregular characters). Push this difference to an array
     - calculate the average of the top and bottom offset of the current word and push it
       to an array (middle offsets)
    */

    // loop #2 - loop through the middle offsets (why tho?)
    /*
     - add middle offsets to word as an attribute to be used later on in the highlight algorithm
     - form necessary arrays to be used in highlight algo
    */
}


// changes the currentParagraphIndex based on which key was pressed
const moveHighlightedLine = (event, currentParagraphIndex) => {

}

// export {wrapWordsInParagraphWithSpanTags, findOffsetsForEveryWordInParagraph, moveHighlightedLine };