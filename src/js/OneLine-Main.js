// UTIL FUNCTIONS
const getValueFromStorage = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data[key]);
            }
        })
    })
}

// updates the css varible that holds the line color,
const updateLineColor = (color) => {
    document.documentElement.style.setProperty("--oneline-active-color", color);
};

function forwardRequest(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        })
    })
}

// async function to update line color & start oneline if switch is set to true, else stops oneline 
// returns the current state of the switch so it can be set in the message event listener 
async function handleTabChange(onOffSwitchState, activeColor, ol) {
    onOffSwitchState = await getValueFromStorage("onOffSwitchState");

    if (onOffSwitchState === true && !location.href.endsWith('.pdf')) {
        activeColor = await getValueFromStorage("activeColor");
        updateLineColor(activeColor);
        ol.start();
    } else if (onOffSwitchState === false) {
        ol.stop();
    }

    return onOffSwitchState; // return current state of switch
}
// PROGRAM LOGIC STARTS HERE

// TODO: Design and implement better auto scroll UI/UX
// TODO: add error handling UX for when oneline finds no text/paragraphs
// TODO: double check everything for Mv3
// OPTIONAL: selection feature for p, headers, code, lists, etc
window.onload = async function () {

    // create the OneLine instance
    let ol = OneLine()
    let onOffSwitchState = await getValueFromStorage("onOffSwitchState");
    let activeColor = await getValueFromStorage("activeColor");

    // don't start OneLine on pdf pages
    if (!location.href.endsWith('.pdf')) {
        
        // start OneLine if switch is set to true
        // maybe add a check here to see if the current page is valid for OneLine
        if (onOffSwitchState === true) {
            updateLineColor(activeColor);
            ol.start();
        }
    }

    // listen for changes in the switch state
    // TODO: make sure all message passing is working with manifest v3
    chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {

        if (msg.tabChanged === true) {
            handleTabChange(onOffSwitchState, activeColor, ol).then((result) => {
                onOffSwitchState = result; // refresh the state of the switch on tab change
                sendResponse({ tabChanged: msg.tabChanged, status: 200 })
            })
        }

        if (msg.switchState === true) {
            onOffSwitchState = msg.switchState
            updateLineColor(activeColor);
            ol.start()
            sendResponse({ switchState: msg.switchState, status: 200 })
        }

        if (msg.switchState === false) {
            onOffSwitchState = msg.switchState
            ol.stop();
            sendResponse({ switchState: msg.switchState, status: 200 })
        }

        if (msg.activeColor && msg.activeColor.includes('#')) {
            activeColor = msg.activeColor
            updateLineColor(activeColor);
            ol.start()
            sendResponse({ activeColor: msg.activeColor, status: 200 })
        }

        // insert pdf coming soon html into default chrome pdf viewer
        if (msg.html) {
            ol.stop()
            document.body.insertAdjacentHTML('beforeend', msg.html);
            // forward request to background script to send user to mailing list sign up (and mark that they signed up)
            $("#ol-signUp").click(() => forwardRequest({ signUp: true }))

            // close the coming soon modal
            $("#ol-dismiss").click(() => {
                $('#oneline-pdf-coming-soon').remove();
            })

            // $('#oneline-open-pdf-btn').click(() => chrome.runtime.sendMessage({ pdf: window.location.href }));
            sendResponse({ htmlInserted: true, status: 200 })
        }

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

            // up arrow pressed
            if (e.keyCode == 38) {

                e.preventDefault();
                ol.moveLine("up");

                // down arrow pressed
            } else if (e.keyCode == 40) {

                e.preventDefault();
                ol.moveLine("down");

            }

        }
    });
}