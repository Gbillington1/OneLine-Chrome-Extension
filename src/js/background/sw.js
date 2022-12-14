function sendMsgToCS(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { msg: message }, function(response) {
            console.log(chrome.runtime.lastError)
        });
    });
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

// load pdf reader
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {  
    if (msg.pdf) {
        chrome.tabs.create({ url: chrome.runtime.getURL(`../../html/pdf.html?pdf_url=${msg.pdf}`)})
    }
    
    // fetch requested html blob and return it to content script
    if (msg.blob) {
        fetch(msg.blob).then(data => data.text()).then(html => {
            sendResponse({html: html})
        });
    }
    return true;

})

// fire tab change event
chrome.tabs.onActivated.addListener((activeInfo) => {
    sendMsgToCS("tab changed")
});