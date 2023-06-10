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

async function sendMsgToCS(message, id = undefined) {
    if (id === undefined) {
        const tab = await getCurrentTab();
        id = tab.id;
    }
    return new Promise((resolve,reject) => {
        chrome.tabs.sendMessage(id, message, function (response) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        })
    })
}

// load default states to storage 
chrome.runtime.onInstalled.addListener(function (details) {

    // get the swtich state, set it to true if it's not set, tell CS to start oneline
    chrome.storage.sync.get("onOffSwitchState", function (result) {
        let onOffSwitchState = result.onOffSwitchState;

        if (onOffSwitchState == undefined) {
            chrome.storage.sync.set({ "onOffSwitchState": true }, function () {
                sendMsgToCS({ onOffSwitchState: true }).then((response) => {
                    // do something with response
                }).catch((err) => { console.error(err) })
            });
        }
    })

    // get the active color, set it to default if there isn't one in storage, tell CS to change the color
    chrome.storage.sync.get("activeColor", function (result) {
        let activeColor = result.activeColor;

        if (activeColor == undefined) {
            activeColor = "#f8fd89";
            chrome.storage.sync.set({ "activeColor": activeColor }, function () {
                sendMsgToCS({ activeColor: activeColor }).then((response) => {
                    // do something with response
                }).catch((err) => { console.error(err) })
            });
        }
    })

    // set initially to true
    chrome.storage.sync.get("showPDFPopup", function (result) {
        if (result.showPDFPopup == undefined) {
            chrome.storage.sync.set({ "showPDFPopup": true })
        }
    })

    if (details.reason == "install") {
        chrome.tabs.create({ url: "https://useoneline.com/thankyou/", active: true }, function (tab) {
            // save this specific ID so we can detect in in the onUpdated listener
            // avoids firing the onUpdated listener when the user goes to thank you on their own (ID will be different)
            chrome.storage.local.set({ "thankyouTabId": tab.id })
        });
    }
    // else if (details.reason == "update") {
    //     chrome.tabs.create({ url: "https://useoneline.com/updates/v2" })
    // }
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    // fetch user from flask app, null if not authenticated
    if (msg.getUser) {
        fetch('http://127.0.0.1:5000/userinfo').then(res => res.json()).then(data => {
            if (data.user) {
                console.log(data.user)
                // chrome.storage.sync.set({ "user": data.user })
            } else {
                console.log("no user")
                // chrome.storage.sync.set({ "user": null })
                // user needs to log in to use app
            }
        })
    }

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

    // reload all pages
    if (msg.reload) {
        chrome.tabs.query({ status: 'complete' }, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url) {
                    chrome.tabs.update(tab.id, { url: tab.url });
                }
            });
        });
        sendResponse({ reload: true, status: 200 })
    }

})

// Tab change: Fire when tab changes, make sure to wait for content script to load before sending message
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    tab = await chrome.tabs.get(activeInfo.tabId)
    // this fires when the user goes to a tab that was already loaded
    if (tab.url) {
        sendMsgToCS({ tabChanged: true }, activeInfo.tabId)
            .then(res => {
                // do something with res
            })
            .catch(err => console.error(err))
    // this fires when the user goes to a tab that hasn't been loaded yet (no URL set on tab)
    } else {
        // wait for content script to send loaded message
        chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
            if (msg.pageLoaded === true) {
                sendMsgToCS({ tabChanged: true }, activeInfo.tabId)
                    .then(res => {
                        // do something with res
                    }).catch(err => {
                        console.error(err)
                    })
                sendResponse({ pageLoaded: true, status: 200 })
            }
        })
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (changeInfo.status == "complete" && tab.url) {

        // check if we're on the thank you page => show the reload popup
        chrome.storage.local.get("thankyouTabId", function (data) {
            if (data.thankyouTabId == tabId) {
                fetch(chrome.runtime.getURL('html/blobs/pageReloadPrompt.html')).then(data => data.text()).then(html => {

                    chrome.scripting.insertCSS({
                        target: { tabId: tab.id },
                        files: ['css/tailwind/out.css']
                    })
                    sendMsgToCS({ "installPopup": html }, tab.id).then((res) => {
                        // do something with res
                    }).catch((err) => { console.error(err) })
                    chrome.storage.local.set({ "thankyouTabId": null }) // make sure we don't fire this popup again
                });

            }
        })

        if (!tab.url.startsWith('chrome-extension://') && tab.url.endsWith('.pdf')) {

            chrome.storage.sync.get('showPDFPopup').then((res) => {

                if (res.showPDFPopup) {
                    fetch(chrome.runtime.getURL('html/blobs/PDFsComingSoon.html')).then(data => data.text()).then(html => {

                        chrome.scripting.insertCSS({
                            target: { tabId: tab.id },
                            files: ['css/tailwind/out.css']
                        })
                        sendMsgToCS({ html: html }, tab.id).then((res) => {
                            // do something with res
                        }).catch((err) => { console.error(err) })

                    });
                }
            })
        }

        // TODO: Handle modern web apps that don't reload the page when new content is loaded (think nextJS & react apps)
        // The issue is that the highlighted content gets lost when new content is loaded, and the line needs to be refreshed to highlight the start of the new content (issue stems from the fact that most code runs when page loads, but new webapps seldom reload page)
        // This should be able to be fixed with a MutationObserver object, listening for changes in the dom, at every change (or some other condition), search the page for more paragraphs and add them into the paragraphs array (will be a tough one to figure out as you have to maintain order of the paragraphs in the array)

    }
});