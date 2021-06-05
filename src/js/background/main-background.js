const sendMsgToCS = (tabNumber, message) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[tabNumber].id, { msg: message });
    });
}

chrome.runtime.onInstalled.addListener((details) => {

    // chrome.storage.sync.set({ "onOffSwitchValue": false });

})

chrome.runtime.onMessage.addListener((message, callback) => {

    

})