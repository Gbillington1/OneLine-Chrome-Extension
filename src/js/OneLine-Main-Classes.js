// UTIL FUNCTIONS
const getValueFromStorage = async (key) => {
    return new Promise((resolve) => {

        chrome.storage.sync.get([key], (data) => {

            resolve(data[key]);

        })

    })
}

// PROGRAM LOGIC STARTS HERE

window.onload = async function () {

    // creaate the OneLine instance
    const oneLine = new OneLine();

    let onOffSwitchState = await getValueFromStorage("onOffSwitchState");
    let activeColor = await getValueFromStorage("activeColor");
    document.documentElement.style.setProperty("--active-color", activeColor);

    // start OneLine if switch is set to true
    if (onOffSwitchState) {
        oneLine.start();
        oneLine.setLineColor(activeColor);
    }

    // listen for changes in the switch state
    chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {

        switch (message.msg) {

            case "on/off switch changed to true":

                onOffSwitchState = true;

                if (!oneLine.oneLineHasStarted) {
                    oneLine.start();
                } else { 
                    oneLine.setLineColor(activeColor);
                }

                break;
            case "on/off switch changed to false":

                onOffSwitchState = false;
                oneLine.stop();

                break;
            case "active color changed":

                activeColor = await getValueFromStorage("activeColor");
                oneLine.setLineColor(activeColor);

                break;
            default:
                break;

            /* 
            TODO: Think about if I should use OneLine to control TTS, or if I should use and TTS controller and instanciate it here
            
            for TTS, listen for "tts start", "tts pause/play", and "tts stop" in here
                case "tts start":
                    oneLine.startTTS(); // starts on current line, feeds utterance instance a line array (see project in documents folder)
                    break;
                case "tts pause/play":
                    oneLine.togglePauseTTS(); // pauses/plays current utterance instance
                    break;
                case "tts stop":
                    oneLine.stopTTS(); // stops and clears current utterance instance

            */

        }

    })

    $(document).keydown((e) => {
        // don't move line when user is editing text in <input> or <textarea> 
        if (!$(e.target).is("input, textarea") && onOffSwitchState) {

            // w or up arrow pressed
            if (e.keyCode == 87 || e.keyCode == 38) {

                e.preventDefault();
                oneLine.moveLine("up");

            // s or down arrow pressed
            } else if (e.keyCode == 83 || e.keyCode == 40) {

                e.preventDefault();
                oneLine.moveLine("down");

            }

        }
    });

}