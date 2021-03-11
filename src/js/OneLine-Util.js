const getParagraphs = () => {
    // get all paragraphs on the page
    // figure out which ones are relevant, scrap the others
    // return an array of relevant paragraphs
    return $("p:visible").not("header p, footer p"); 
}

const splitParagraph = (paragraph) => {
    // using splitting.js to split the paragraph into words using the custom pluggin
    Splitting( { target: paragraph, by: "customPluggin" } ) // rename "Custom Pluggin" to something else
}

// export const getWordsInSpanTags = () => {

// }

// export {getParagraphs, splitParagraph };