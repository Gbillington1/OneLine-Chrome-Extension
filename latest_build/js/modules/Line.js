/*
 - Module that represents a single line
 - Controls the highlighting of the line
 - Will be used to add more features that are line specific in the future
*/
const Line = (spansInLine) => {

    // array of original color of each span in the line
    let colorsOfWords = [];

    // helper function for calculateWordColorWithYIQ, converts colorString to rgb object
    const convertToRGB = (colorString) => {
        // returns true if the string is a hex color, false otherwise
        const regex = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$")
        let r, g, b; 
        // is hex
        if (regex.test(colorString)) {
            r = parseInt(colorString.slice(1, 3), 16)
            g = parseInt(colorString.slice(3, 5), 16)
            b = parseInt(colorString.slice(5, 7), 16)
        // is rgb
        } else {
            let rgb = colorString.match(/\d+/g);
            r = rgb[0];
            g = rgb[1];
            b = rgb[2];
        }

        return {r, g, b} 
    }

    // use YIQ to calculate the optimial color of the word (easiest to read) 
    const calculateWordColorWithYIQ = (backgroundColorString) => {
        const rgb = convertToRGB(backgroundColorString);
        const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    }

    const highlightLine = () => {

        let backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--oneline-active-color');
        let optimalWordColor = calculateWordColorWithYIQ(backgroundColor);
        for (let i = 0; i < spansInLine.length; i++) {
            spansInLine[i].classList.add("highlighted");
            // save the color of the text of each word in the line (to an array?)
            colorsOfWords.push($(spansInLine[i]).css("color"));
            // change the color of the text of each word in the line
            $(spansInLine[i]).css("color", optimalWordColor);
            $(spansInLine[i]).attr("ol-data-color", $(spansInLine[i]).css("color"));

        }    
    }

    const removeHighlightFromLine = () => {
        
        for (let i = 0; i < spansInLine.length; i++) {
            // revert the value of the word back to the original color
            $(spansInLine[i]).css("color", colorsOfWords[i]);
            $(spansInLine[i]).removeClass('highlighted');
        }
    }

    return {

        highlightLine,
        removeHighlightFromLine

    }

}