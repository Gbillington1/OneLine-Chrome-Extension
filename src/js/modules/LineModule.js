/*
 - Module that represents a single line
 - Controls the highlighting of the line
 - Will be used to add more features that are line specific in the future
*/
const LineModule = (spansInLine) => {

    const highlightLine = () => {

        for (i = 0; i < spansInLine.length; i++) {
            spansInLine[i].classList.add("highlighted");
        }

    }

    const removeHighlighFromLine = () => {

        for (i = 0; i < spansInLine.length; i++) {
            spansInLine[i].classList.remove("highlighted");
        }
    }

    return {

        highlightLine,
        removeHighlighFromLine

    }

}