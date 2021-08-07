const sendMsgToCS = (message) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { msg: message });
    });
}

export const getValueFromStorage = async (key) => {
    return new Promise((resolve) => {

        chrome.storage.sync.get([key], (data) => {

            resolve(data[key]); 

        })

    })
}

chrome.runtime.onInstalled.addListener((details) => {

    // chrome.storage.sync.set({ "onOffSwitchValue": false });

})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    if (message == 'get-switch-state') {

        const state = await getValueFromStorage('onOffSwitchState');
        console.log(state)  

        sendResponse(state)

    }

})