const sendMsgToCS = (message) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { msg: message });
    });
}

const getValueFromStorage = async (key) => {
    return new Promise((resolve) => {

        chrome.storage.sync.get([key], (data) => {

            resolve(data[key]); 

        })

    })
}

// load default states to storage 
chrome.runtime.onInstalled.addListener(function(details) {

    if (details.reason == "install") {

        // get the swtich state, set it to true if it's not set, tell CS to start oneline
        chrome.storage.sync.get("onOffSwitchState", function(result) {
            let onOffSwitchState = result.onOffSwitchState;

            if (onOffSwitchState == undefined) {
                chrome.storage.sync.set({ "onOffSwitchState": true}, sendMsgToCS("on/off switch changed to true"));
            }
        })

        // get the active color, set it to default if there isn't one in storage, tell CS to change the color
        chrome.storage.sync.get("activeColor", function(result) {
            let activeColor = result.activeColor;

            if (activeColor == undefined) {
                chrome.storage.sync.set({ "activeColor": "#f8fd89"}, sendMsgToCS("active color changed"));
            } 
        })

    }

})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.pdf) {
        chrome.tabs.create({ url: chrome.runtime.getURL(`../../html/pdf.html?pdf_url=${request.pdf}`) })
    }
})