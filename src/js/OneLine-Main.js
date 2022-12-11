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

// loads a button to open PDF with OneLine reader
const loadOneLinePDFWidget = () => {
    const widget = document.createElement('div');
    widget.id = 'oneline-pdf-widget';
    widget.style = 'position: absolute; top: 0px; right: 0px';

    const root = document.createElement('div');
    root.id = 'oneline-pdf-widget-root';
    root.style = 'position: fixed; z-index: 2247483645; bottom: 50px; right: 32px;';
    widget.appendChild(root);

    const openBtn = document.createElement('button');
    openBtn.id = 'oneline-pdf-widget-open-btn';
    openBtn.style = 'background-color: #2a7861; border: 2px solid #f6f4f7; border-radius: 5px; box-shadow: 2px 2x 10px black; padding: 5px 10px; font-size: 16px; font-weight: bold; cursor: pointer; color: #f6f4f7;';
    openBtn.innerHTML = 'Open in OneLine';

    openBtn.onclick = () => {
        chrome.runtime.sendMessage({ pdf: window.location.href });
    }

    root.appendChild(openBtn);

    document.body.appendChild(widget);
}

// PROGRAM LOGIC STARTS HERE

window.onload = async function () {
    console.log('loadededed')

    // detect PDF and load widget into page
    if (!window.location.href.startsWith('chrome-extension://') && window.location.href.includes('.pdf')) {
        loadOneLinePDFWidget();
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