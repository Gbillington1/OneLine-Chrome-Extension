//get current bool state of switch
var highlightedSwitchVal = $("#highlightedSwitch").is(":checked");

//initiate connection with background page
chrome.runtime.sendMessage({ msg: "initiate" });

//function that saves state if switch to chrome storage
function saveVal(valueToSave) {
    chrome.storage.sync.set({ 'highlightedSwitch': valueToSave })
}

//function to load value from storage that was saved in saveVal()
function loadVal() {
    let value = new Promise((resolve) => {
        chrome.storage.sync.get('highlightedSwitch', function (result) {
            resolve(result.highlightedSwitch);
        });
    })
    return value;
}

//when first isntalled, set switch to true and save that value
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.msg == "Extension installed") {
        let onInstallValue = $("#highlightedSwitch").prop("checked", true);
        $("#highlightedSwitch").prop("checked", onInstallValue);
    }
})

function sendMsgToCS(tabNumber, message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[tabNumber].id, {msg: message})
    })
}

$(document).ready(async function () {
    //load value from storage
    var loadedVal = await loadVal();
    $("#highlightedSwitch").prop("checked", loadedVal);
    var msg = JSON.stringify(loadedVal);

    //save value when it is changed
    $("#highlightedSwitch").change(function () {
        highlightedSwitchVal = $("#highlightedSwitch").is(":checked");
        saveVal(highlightedSwitchVal);
        msg = "changed to " + JSON.stringify(highlightedSwitchVal);
        sendMsgToCS(0, msg);
    });
});

