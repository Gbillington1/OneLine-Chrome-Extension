const getValueFromStorage = async (key) => {
    return new Promise((resolve) => {

        chrome.storage.sync.get([key], (data) => {

            resolve(data[key]);

        })

    })
}

window.onload = () => {

    // create a "global" ParagraphControllerModule to manage the paragraphs
    let ParagraphController = ParagraphControllerModule();

    // creaate the OneLine instance
    const OneLine = OneLineModule(ParagraphController);

    let onOffSwitchState = getValueFromStorage("onOffSwitchState");

    // start OneLine if switch is set to true
    if (onOffSwitchState) {

        OneLine.start();
    }

    // listen for changes in the switch state
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

        if (message.msg == "on/off switch changed to true") {
            onOffSwitchState = true;
            OneLine.start();
        } else if (message.msg == "on/off switch changed to false") {
            onOffSwitchState = false;
            OneLine.stop();
        }

    })

    // should this be in OneLineModule? 
    $(document).keydown((e) => {
        // don't move line when user is editing text in <input> or <textarea> 
        if (!$(e.target).is("input, textarea")) {
            ParagraphController.moveParagraph(e);
        }
    });

}