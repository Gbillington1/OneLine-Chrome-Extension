$(document).ready(async function () {
    function loadVal() {
        return new Promise((resolve) => {
            chrome.storage.sync.get('highlightedCheckBox', function (result) {
                resolve(result.highlightedCheckBox);
            });
        })
    }
    
    function saveVal() {
        chrome.storage.sync.set({ 'highlightedCheckBox': highlightedCheckBoxVal })
        console.log("saving value to storage as " + highlightedCheckBoxVal)
    }
    
    chrome.runtime.onInstalled.addListener(function() {
        console.log("newly installed");
        saveVal();
    })
    
    var highlightedCheckBoxVal = $("#highlightedCheckbox").is(":checked");
    
    highlightedCheckBoxVal = await loadVal();
    console.log("loading value as " + highlightedCheckBoxVal);
    
    
    $("#highlightedCheckbox").change(function () {
        console.log("changed");
        highlightedCheckBoxVal = $("#highlightedCheckbox").is(":checked");
        saveVal();
    });
    
    $(document).keyup(function(e) {
        if (e.keyCode == 120) {
            chrome.storage.sync.clear();
            console.log("storage cleared");
        }
    })
});

