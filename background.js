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
            isInstalled = false;
        }
    } 
})

//listen for tab change
chrome.tabs.onActivated.addListener(function() {
    //send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {msg: "tab changed"})
    })
})
