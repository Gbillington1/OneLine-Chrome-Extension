// message: { key: value }
function sendMsgToCS(id = undefined, message) {
    if (id == undefined) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            id = tabs[0].id;
        });
    }

    chrome.tabs.sendMessage(id, message, function (response) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message)
        }

        if (response) {
            console.log(response)
        }
    });
}

// load default states to storage 
chrome.runtime.onInstalled.addListener(function (details) {

    if (details.reason == "install") {

        // get the swtich state, set it to true if it's not set, tell CS to start oneline
        chrome.storage.sync.get("onOffSwitchState", function (result) {
            let onOffSwitchState = result.onOffSwitchState;

            if (onOffSwitchState == undefined) {
                chrome.storage.sync.set({ "onOffSwitchState": true }, sendMsgToCS({ switchState: true }));
            }
        })

        // get the active color, set it to default if there isn't one in storage, tell CS to change the color
        chrome.storage.sync.get("activeColor", function (result) {
            let activeColor = result.activeColor;

            if (activeColor == undefined) {
                activeColor = "#f8fd89";
                chrome.storage.sync.set({ "activeColor": activeColor }, sendMsgToCS({ activeColor: activeColor }));
            }
        })

        // set the email sign up to false
        chrome.storage.sync.get("emailSignUp", function (result) {
            if (result.emailSignUp == undefined) {
                chrome.storage.sync.set({ "emailSignUp": false })
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
        chrome.tabs.create({ url: "https://useoneline.com/email_list" })
        sendResponse({ signUp: true, status: 200 })
    }
    return true;
})

// fire tab change event
// happens before the page is loaded, so it throws an error in the service worker
chrome.tabs.onActivated.addListener((activeInfo) => {
    sendMsgToCS(activeInfo.tabId, { tabChanged: true }) 
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == "complete" && tab.url) {

        if (!tab.url.startsWith('chrome-extension://') && tab.url.endsWith('.pdf')) {
            chrome.storage.sync.get('emailSignUp').then((res) => {
                console.log(`emailSignUp: ${res.emailSignUp}`)
                if (!res.emailSignUp) {
                    fetch(chrome.runtime.getURL('html/blobs/PDFsComingSoon.html')).then(data => data.text()).then(html => {

                        // add tailwind css to the page (this way we don't have to add it to the manifest.json, in turn adding it to every page like a content script. that causes css conflicts)
                        chrome.scripting.insertCSS({
                            target: { tabId: tab.id }, 
                            files: ['css/tailwind/out.css']
                        })
                        sendMsgToCS(tab.id, { html: html })

                    });
                }
            })
        }

        if (tab.url == "https://useoneline.com/email_list") {
            sendMsgToCS(tab.id, { listenForSubscription: true })
        }
        // TODO: Handle modern web apps that don't reload the page when new content is loaded (think nextJS & react apps)
        // The issue is that the highlighted content gets lost when new content is loaded, and the line needs to be refreshed to highlight the start of the new content (issue stems from the fact that most code runs when page loads, but new webapps seldom reload page)

    }
});