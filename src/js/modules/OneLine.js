/*
 - Module to perform basic functions of OneLine
 - Can start and stop the highlighting of the program
 - Controls TTS?
*/
import $ from 'jquery';
import ParagraphController from './ParagraphController';
import {loadHTMLFromStorage} from "../utils/contentScripts";
import { forwardRequest } from "../utils/global"

const OneLine = function OneLine(onOffSwitchState) {

    const paragraphController = ParagraphController();
    let isOn = onOffSwitchState;

    const start = () => {

        // TODO: Find better way to check if we have started because this doesn't always work (splitting.js.org breaks because it has span.word and whitespace)
        if ($('span.word:not(style *), span.whitespace:not(style *)').length === 0) {
            let result = paragraphController.populateRelevantParagraphArray();
            // if result is -1, then there are no paragraphs on the page
            if (result === -1) {
                // tell sw to load blob for page alert
                forwardRequest({showUnsupportedPageAlert: true}).then(async (resp) => {
                    if (resp.showUnsupportedPageAlert) {
                        await loadHTMLFromStorage()
                    }
                })
            } else {
                paragraphController.createOneLineParagraph();
            }
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
export default OneLine;