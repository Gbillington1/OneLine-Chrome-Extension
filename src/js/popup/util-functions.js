export const sendMsgToCS = (message) => {
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

export const loadActivePage = async () => {

    getValueFromStorage("activePage").then((activePage) => {

        if (activePage == "colorSettings.html") {
            window.location.href = "colorSettings.html";
        } else if (activePage == "textToSpeech.html") {
            window.location.href = "textToSpeech.html";
        }

    });

}

export const goToDefaultPage = () => {

    chrome.storage.sync.set({ "activePage": "deafultPopup.html" });
    window.location.href = "defaultPopup.html";

}

export const loadOnOffSwitch = async () => {

    const onOffSwitchState = await getValueFromStorage("onOffSwitchState");
    $("#onOffSwitch").prop("checked", onOffSwitchState);

}