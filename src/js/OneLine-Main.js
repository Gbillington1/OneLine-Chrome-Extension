// UTIL FUNCTIONS
const getValueFromStorage = async (key) => {
    return new Promise((resolve) => {

        chrome.storage.sync.get([key], (data) => {

            resolve(data[key]);

        })

    })
}

// updates the css varible that holds the line color,
// also starts OneLine
const updateLineColor = (OneLine, color) => {
    document.documentElement.style.setProperty("--active-color", color);
    OneLine.start()
};

// PROGRAM LOGIC STARTS HERE

window.onload = async function () {

    // creaate the OneLine instance
    const OneLine = OneLineModule();

    let onOffSwitchState = await getValueFromStorage("onOffSwitchState");
    let activeColor = await getValueFromStorage("activeColor");

    // start OneLine if switch is set to true
    if (onOffSwitchState) {
        updateLineColor(OneLine, activeColor);
    }

    // listen for changes in the switch state
    chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {

        switch (message.msg) {

            case "on/off switch changed to true":

                onOffSwitchState = true;
                updateLineColor(OneLine, activeColor);

                break;
            case "on/off switch changed to false":

                onOffSwitchState = false;
                OneLine.stop();

                break;
            case "active color changed":

                activeColor = await getValueFromStorage("activeColor");
                updateLineColor(OneLine, activeColor);

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

    })

    $(document).keydown((e) => {
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