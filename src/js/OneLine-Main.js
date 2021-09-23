// UTIL FUNCTIONS
const getValueFromStorage = async (key) => {
    return new Promise((resolve) => {

        chrome.storage.sync.get([key], (data) => {

            resolve(data[key]);

        })

    })
}

// updates the css varible that holds the line color
const updateLineColor = (color) => {
    document.documentElement.style.setProperty("--active-color", color);
};

// PROGRAM LOGIC STARTS HERE

window.onload = async function() {

    // create a "global" ParagraphControllerModule to manage the paragraphs
    let ParagraphController = ParagraphControllerModule();

    // creaate the OneLine instance
    const OneLine = OneLineModule(ParagraphController);

    let onOffSwitchState = await getValueFromStorage("onOffSwitchState");
    let activeColor = await getValueFromStorage("activeColor");

    // start OneLine if switch is set to true
    if (onOffSwitchState) {
        updateLineColor(activeColor);
        OneLine.start();
    }

    // listen for changes in the switch state
    chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {

        switch (message.msg) {
        
            case "on/off switch changed to true":

                onOffSwitchState = true;
                OneLine.start();

                break;
            case "on/off switch changed to false":

                onOffSwitchState = false;
                OneLine.stop();

                break;
            case "active color changed":

                activeColor = await getValueFromStorage("activeColor");
                updateLineColor(activeColor);

                break;
            default:
                break;

        }

    })

    // should this be in OneLineModule? 
    $(document).keydown((e) => {
        // don't move line when user is editing text in <input> or <textarea> 
        if (!$(e.target).is("input, textarea") && onOffSwitchState) {
            ParagraphController.moveParagraph(e);
        }
    });

}