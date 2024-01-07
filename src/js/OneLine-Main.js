import {
    updateLineColor,
    handleTabChange,
    getRefreshedUser,
    buildInitMsgOptions,
    loadHTMLFromStorage
} from './utils/contentScripts';
import { getValueFromStorage, forwardRequest } from './utils/global'
import {restartOneLinePDF, startOneLinePDF} from './utils/pdf'
import OneLine from './modules/OneLine';
import $ from 'jquery';

// TODO: Design and implement better auto scroll UI/UX
// TODO: add error handling UX for when oneline finds no text/paragraphs
// TODO: double check everything for Mv3
// OPTIONAL: selection feature for p, headers, code, lists, etc
window.onload = async function () {
    // fetch user from storage
    let user = await getRefreshedUser();
    if (user === null) {
        chrome.storage.sync.set({"onOffSwitchState": false})
    }
    let msgOptions = buildInitMsgOptions(user);

    // send initial msg (loads html blobs & sets popup html)
    forwardRequest(msgOptions).then(async resp => {
        if (resp.injectHTMLBlob) {
            await loadHTMLFromStorage()
        }
    })

    // load HTML set in service worker if any
    await loadHTMLFromStorage()
    // create the OneLine instance
    let onOffSwitchState = await getValueFromStorage("onOffSwitchState");
    let ol = OneLine(onOffSwitchState)
    let activeColor = await getValueFromStorage("activeColor");
    let movedLineOnPage = false;
    // let abionicSwtichState = await getValueFromStorage("abionicSwitchState");

    // don't start OneLine on pdf pages
    if (!location.href.endsWith('.pdf')) {

        // start OneLine if switch is set to true
        // maybe add a check here to see if the current page is valid for OneLin

        if (onOffSwitchState === true) {
            forwardRequest({ trackEvent: {
                    "name": "oneline_loaded_with_master_active",
                    "properties": {
                        "url": window.location.href
                    }
                }
            })
            updateLineColor(activeColor);
            ol.start();
        }

        // if (abionicSwtichState === true) {
        //     ol.toggleAbionic();
        //     if (onOffSwitchState === true) {
        //         ol.resize();
        //     }
        // }
    } else {
        // if we are on the OneLine PDF viewer page
        if (location.href.includes(`${process.env.API_HOST}/view_pdf?file`)) {
            startOneLinePDF(activeColor)
        }
    }

    chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {

        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
        }

        if (msg.tabChanged === true) {
            handleTabChange(onOffSwitchState, activeColor, ol).then((result) => {
                onOffSwitchState = result; // refresh the state of the switch on tab change
            })
            sendResponse({ complete: true, status: 200 }) // this line can't be in the .then() block or else it wont send a reponse back to the service worker
        }

        if (msg.onOffSwitchState === true) {
            onOffSwitchState = msg.onOffSwitchState
            forwardRequest({ trackEvent: {
                    "name": "oneline_loaded_with_master_active",
                    "properties": {
                        "url": window.location.href
                    }
                }
            })
            getValueFromStorage("activeColor").then(activeColor => {
                updateLineColor(activeColor);
                ol.start()
                sendResponse({ complete: true, status: 200 })
            });
        }

        if (msg.onOffSwitchState === false) {
            onOffSwitchState = msg.onOffSwitchState
            ol.stop();
            sendResponse({ complete: true, status: 200 })
        }

        // handle active color update for web & pdf
        if (msg.activeColor && msg.activeColor.includes('#')) {
            activeColor = msg.activeColor
            updateLineColor(activeColor);
            if (onOffSwitchState === true) {
                if (location.href.includes(`${process.env.API_HOST}/view_pdf?file`)) {
                    restartOneLinePDF(activeColor)
                } else if (!location.href.endsWith('.pdf')) {
                    ol.start()
                }
            }
            sendResponse({ complete: true, status: 200 })
        }

        // ABIONIC LISTENERS -- NEEDS REFACTORING
        // if (msg.abionicSwitchState === true) {
        //     abionicSwtichState = msg.abionicSwitchState
        //     onOffSwitchState = await getValueFromStorage("onOffSwitchState");
        //     if (onOffSwitchState === true) {
        //         activeColor = await getValueFromStorage("activeColor");
        //         updateLineColor(activeColor)
        //         ol.clearPage();
        //         ol.start()
        //         ol.toggleAbionic()
        //         ol.resize()
        //     } else if (onOffSwitchState === false) {
        //         ol.toggleAbionic()
        //     }
        //     sendResponse({ complete: true, status: 200 })
        // }
        //
        // if (msg.abionicSwitchState === false) {
        //     abionicSwtichState = msg.abionicSwitchState
        //     onOffSwitchState = await getValueFromStorage("onOffSwitchState");
        //     if (onOffSwitchState === true) {
        //         activeColor = await getValueFromStorage("activeColor");
        //         updateLineColor(activeColor)
        //         ol.clearPage();
        //         ol.toggleAbionic()
        //         ol.start()
        //         ol.resize()
        //     } else if (onOffSwitchState === false) {
        //         ol.toggleAbionic()
        //     }
        //     sendResponse({ complete: true, status: 200 })
        // }

        /* 
        TODO: Think about if I should use OneLine to control TTS, or if I should use and TTS controller and instanciate it here
        
        for TTS, listen for "tts start", "tts pause/play", and "tts stop" in here
            case "tts start":
                ol.startTTS(); // starts on current line, feeds utterance instance a line array (see project in documents folder)
                break;
            case "tts pause/play":
                ol.togglePauseTTS(); // pauses/plays current utterance instance
                break;
            case "tts stop":
                ol.stopTTS(); // stops and clears current utterance instance
 
        */

        // indicate that response will be sent asynchronously
        return true
    })

    // resize lines
    // this fires on pdf pages and throws an error because we don't have pdf support yet
    $(window).resize(() => {
        if (onOffSwitchState === true && !location.href.endsWith('.pdf')) {
            ol.resize();
        }
    });

    // todo: add more methods for moving the line (scroll, mouse, clicking on lines/paragraphs)
    $(document).keydown(function (e) {
        // don't move line when user is editing text in <input> or <textarea> 
        if (!$(e.target).is("input, textarea") && onOffSwitchState) {

            // arrow keys pressed and we haven't tracked a line movement on this page
            if ((e.keyCode === 38 || e.keyCode === 40) && !movedLineOnPage) {
                forwardRequest({ trackEvent: {
                        "name": "oneline_moved_on_page",
                        "properties": {
                            "url": window.location.href
                        }
                    }
                })
                movedLineOnPage = true;
            }

            // up arrow pressed
            if (e.keyCode === 38) {

                e.preventDefault();
                ol.moveLine("up");

                // down arrow pressed
            } else if (e.keyCode === 40) {

                e.preventDefault();
                ol.moveLine("down");

            }

        }
    });

    forwardRequest({ pageLoaded: true })
}