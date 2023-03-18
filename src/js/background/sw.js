function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(tabs[0]);
            }
        });
    });
}

function sendMsgToTab(id, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(id, message, function (response) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

async function sendMsgToCS(message, id = undefined) {
    try {
        if (id === undefined) {
            const tab = await getCurrentTab();
            id = tab.id;
        }
        res = await sendMsgToTab(id, message)
    } catch(e) {
        console.error(e)
    }
}

// load default states to storage 
chrome.runtime.onInstalled.addListener(function (details) {

    if (details.reason == "install") {

        // get the swtich state, set it to true if it's not set, tell CS to start oneline
        chrome.storage.sync.get("onOffSwitchState", function (result) {
            let onOffSwitchState = result.onOffSwitchState;

            if (onOffSwitchState == undefined) {
                chrome.storage.sync.set({ "onOffSwitchState": true }, function() {
                    sendMsgToCS({ switchState: true })
                });
            }
        })

        // get the active color, set it to default if there isn't one in storage, tell CS to change the color
        chrome.storage.sync.get("activeColor", function (result) {
            let activeColor = result.activeColor;

            if (activeColor == undefined) {
                activeColor = "#f8fd89";
                chrome.storage.sync.set({ "activeColor": activeColor }, function() {
                    sendMsgToCS({ activeColor: activeColor })
                });
            }
        })

        // set initially to true
        chrome.storage.sync.get("showPDFPopup", function (result) {
            if (result.showPDFPopup == undefined) {
                chrome.storage.sync.set({ "showPDFPopup": true })
            }
        })

    }

})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // load pdf reader
    if (msg.pdf) {
        chrome.tabs.create({ url: chrome.runtime.getURL(`../../html/pdf.html?pdf_url=${msg.pdf}`) })
        sendResponse({ openPDF: true, status: 200 })
    }

    if (msg.signUp) {
        chrome.tabs.create({ url: "https://useoneline.com/newsletter/signup?source=pdf" })
        sendResponse({ signUp: true, status: 200 })
    }

    if (msg.popupEmailList) {
        chrome.tabs.create({ url: "https://useoneline.com/newsletter/signup?source=popup" })
        sendResponse({ popupEmailList: true, status: 200 })
    }

    if (!msg.showPDFPopup) {
        chrome.storage.sync.set({ "showPDFPopup": false })
        sendResponse({ showPDFPopup: false, status: 200 })
    }

})

// fire tab change event
// sending message before content scripts are loaded, so it throws an error. 
chrome.tabs.onActivated.addListener((activeInfo) => {
    sendMsgToCS({ tabChanged: true }, activeInfo.tabId)
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (changeInfo.status == "complete" && tab.url) {

        if (!tab.url.startsWith('chrome-extension://') && tab.url.endsWith('.pdf')) {

            chrome.storage.sync.get('showPDFPopup').then((res) => {

                if (res.showPDFPopup) {
                    fetch(chrome.runtime.getURL('html/blobs/PDFsComingSoon.html')).then(data => data.text()).then(html => {

                        chrome.scripting.insertCSS({
                            target: { tabId: tab.id },
                            files: ['css/tailwind/out.css']
                        })
                        sendMsgToCS({ html: html }, tab.id)

                    });
                }
            })
        }

        // TODO: Handle modern web apps that don't reload the page when new content is loaded (think nextJS & react apps)
        // The issue is that the highlighted content gets lost when new content is loaded, and the line needs to be refreshed to highlight the start of the new content (issue stems from the fact that most code runs when page loads, but new webapps seldom reload page)
        // This should be able to be fixed with a MutationObserver object, listening for changes in the dom, at every change (or some other condition), search the page for more paragraphs and add them into the paragraphs array (will be a tough one to figure out as you have to maintain order of the paragraphs in the array)

    }
});