// UTIL FUNCTIONS
const getValueFromStorage = async (key) => {
    return new Promise((resolve) => {

        chrome.storage.sync.get([key], (data) => {

            resolve(data[key]);

        })

    })
}

// updates the css varible that holds the line color,
const updateLineColor = (color) => {
    document.documentElement.style.setProperty("--active-color", color);
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

// PROGRAM LOGIC STARTS HERE

window.onload = async function () {
    const href = window.location.href;
    // check if page is PDF
    if (!href.startsWith('chrome-extension://') && href.includes('.pdf')) {
        // request html blob from service worker
        const res = await forwardRequest({ blob: chrome.runtime.getURL('html/blobs/openPDF.html')})

        // if blob is returned, insert it into the page
        if (res.html) {
            document.body.insertAdjacentHTML('beforeend', res.html);
            $('#oneline-open-pdf-btn').click(() => chrome.runtime.sendMessage({ pdf: href }));
        }
    }

    // create the OneLine instance
    const OneLine = OneLineModule();

    let onOffSwitchState = await getValueFromStorage("onOffSwitchState");
    let activeColor = await getValueFromStorage("activeColor");

    // start OneLine if switch is set to true
    if (onOffSwitchState) {
        updateLineColor(activeColor);
        OneLine.start();
    }

    // listen for changes in the switch state
    // TODO: make sure all message passing is working with manifest v3
    chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {

        switch (message.msg) {

            case "tab changed":
                onOffSwitchState = await getValueFromStorage("onOffSwitchState");

                if (onOffSwitchState === true) {
                    activeColor = await getValueFromStorage("activeColor");
                    updateLineColor(activeColor);
                    OneLine.start();
                } else if (onOffSwitchState === false) {
                    OneLine.stop();
                }
                break;
    

            case "on/off switch changed to true":

                onOffSwitchState = await getValueFromStorage("onOffSwitchState");
                updateLineColor(activeColor);
                OneLine.start()

                break;
            case "on/off switch changed to false":

                onOffSwitchState = await getValueFromStorage("onOffSwitchState");
                OneLine.stop();

                break;
            case "active color changed":

                activeColor = await getValueFromStorage("activeColor");
                updateLineColor(activeColor);
                OneLine.start()

                break;
            default:
                break;

            /* 
            TODO: Think about if I should use OneLine to control TTS, or if I should use and TTS controller and instanciate it here
            
            for TTS, listen for "tts start", "tts pause/play", and "tts stop" in here
                case "tts start":
                    OneLine.startTTS(); // starts on current line, feeds utterance instance a line array (see project in documents folder)
                    break;
                case "tts pause/play":
                    OneLine.togglePauseTTS(); // pauses/plays current utterance instance
                    break;
                case "tts stop":
                    OneLine.stopTTS(); // stops and clears current utterance instance
 
            */

        }
        return true;
    })
    
    $(document).keydown(function (e) {
        // don't move line when user is editing text in <input> or <textarea> 
        if (!$(e.target).is("input, textarea") && onOffSwitchState) {
    
            // w or up arrow pressed
            if (e.keyCode == 87 || e.keyCode == 38) {
    
                e.preventDefault();
                OneLine.moveLine("up");
    
                // s or down arrow pressed
            } else if (e.keyCode == 83 || e.keyCode == 40) {
    
                e.preventDefault();
                OneLine.moveLine("down");
    
            }
    
        }
    });
}