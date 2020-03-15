//when installed, set var to true
var isInstalled = false;
chrome.runtime.onInstalled.addListener(function() {
    isInstalled = true;
})

//listen for initiate message, then send message if isInstalled == true
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.msg == "initiate") {
        if (isInstalled) {
            chrome.runtime.sendMessage({msg: "Extension installed"});
            console.log("message sent");
            isInstalled = false;
        }
    } 
})
