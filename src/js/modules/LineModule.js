/*
 - Module that represents a single line
 - Controls the highlighting of the line
 - Will be used to add more features that are line specific in the future
*/
const LineModule = (spansInLine) => {

    const highlightLine = () => {

        $(spansInLine).find("span").addClass("highlighted"); 

    }

    const removeHighlighFromLine = () => {

        $(spansInLine).find("span").removeClass("highlighted");

    }

    return {

        highlightLine,
        removeHighlighFromLine

    }

}