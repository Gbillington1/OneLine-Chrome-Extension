/*
 - Module to perform basic functions of OneLine
 - Can start and stop the highlighting of the program
 - Controls TTS?
*/

const OneLine = (onOffSwitchState) => {

    const paragraphController = ParagraphController();
    let isOn = onOffSwitchState;

    const start = () => {

        if ($('span.word:not(style *), span.whitespace:not(style *)').length === 0) {
            let result = paragraphController.populateRelevantParagraphArray();
            
            // if result is -1, then there are no paragraphs on the page
            // notify user
            console.log(result)
            if (result === -1) {
                // ideally show a popup that allows users to input if this is a mistake, or if there is an issue with this page (sort of like a report bug button)
                // and stop execution of the program
                // maybe have this check in move line so the popup doesnt come up every time the page loads? Think about when you want the user to be shown the popup
            };
            
            paragraphController.createOneLineParagraph();
        
        }

        paragraphController.beginHighlighting();
        isOn = true;
    }

    const stop = () => {
        if (isOn) {
            paragraphController.removeHighlightFromParagraphs();
        }
        isOn = false;
    }

    const resize = () => {
        paragraphController.removeHighlightFromParagraphs();
        paragraphController.refreshLines();
        paragraphController.beginHighlighting();
    }

    const clearPage = () => {
        isOn = false;
        paragraphController.removeHighlightFromParagraphs();
        paragraphController.clearParagraphs();
    }

    const moveLine = (direction) => {
        
        if ($("span.word:not(style *), span.whitespace:not(style *)").length === 0) {
            // cleaner alert to user (html popup/injection)
            alert("There is no text to move.");
        } else {
            switch (direction) {
                case "up":
                    paragraphController.moveLineUp();
                    break;
                case "down":
                    paragraphController.moveLineDown();
                    break;
                default:
                    console.warn(`Invalid direction "${direction}" provided.`);
            }
            
            let highlighted = $('span.highlighted');
            if (!paragraphController.isLineVisibleInViewport() && highlighted.length > 0) {
                highlighted[0].scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }

    const toggleAbionic = () => {

        if ($("[data-ol-abionic]").length == 0 && paragraphController.getRelevantParagraphCount() == 0) {
            paragraphController.populateRelevantParagraphArray();
            paragraphController.createOneLineParagraph();
        }
        paragraphController.toggleAbionic();

    }
    

    /*
    TODO: Should I add some type of TTS controller that can do all of this? Think about the best way to implement this feature.

    - Function to start the TTS
    - Accesses paragraphController that contains another TTS function
        - This function will feed each line into the Utterance instance and probably call another function to move the line down the screen

    - Function to stop the TTS
    - Somehow accesses the Utterance instance and calls the stop() function

    - Function to toggle play/pause of TTS
    - Access the Utterance instance and call the pause() and resume() functions
    */

    return {

        start,
        stop,
        resize,
        moveLine,
        toggleAbionic,
        clearPage
    }

}