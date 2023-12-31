import { sendMsgToCS } from "../utils/globalUtils";
import {initActiveColor, initOnOffSwitchState, handleReason, fetchUser, handleOnActivated} from "../utils/swUtils";

// load default states to storage 
chrome.runtime.onInstalled.addListener(function (details) {
    initOnOffSwitchState();
    initActiveColor();
    handleReason(details.reason);
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    // fetch user from flask app, null if not authenticated
    if (msg.getUser) {
        fetchUser.then((user) => {
            sendResponse({ getUser: user, status: 200})
        })
    }

    // load pdf reader
    if (msg.pdf) {
        // TODO: Update to prod URL
        chrome.tabs.create({ url: `http://127.0.0.1:5000/view_pdf?file=${encodeURIComponent(msg.pdf)}` })
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
    let tab = await chrome.tabs.get(activeInfo.tabId)
    // this fires when the user goes to a tab that was already loaded
    if (tab.url) {
        sendMsgToCS({ tabChanged: true }, activeInfo.tabId).catch(err => console.error(err))
        // this fires when the user goes to a tab that hasn't been loaded yet (no URL set on tab)
    } else {
        // wait for content script to send loaded message
        chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
            if (msg.pageLoaded === true) {
                sendMsgToCS({ tabChanged: true }, activeInfo.tabId).catch(err => {
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
                fetch(chrome.runtime.getURL('dist/html/blobs/pageReloadPrompt.html')).then(data => data.text()).then(html => {

                    chrome.scripting.insertCSS({
                        target: { tabId: tab.id },
                        files: ['dist/css/tailwind/out.css']
                    })
                    sendMsgToCS({ "installPopup": html }, tab.id).catch((err) => { console.error(err) })
                    chrome.storage.local.set({ "thankyouTabId": null }) // make sure we don't fire this popup again
                });

            }
        })

        // TODO: Update to prod URL
        if (!tab.url.includes('127.0.0.1:5000/view_pdf?file=') && tab.url.endsWith('.pdf')) {
            fetch(chrome.runtime.getURL('dist/html/blobs/openPDFInOneLinePopup.html')).then(data => data.text()).then(html => {
                chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files: ['dist/css/tailwind/out.css']
                })
                sendMsgToCS({ openPDFPopupHtml: html }, tab.id).catch((err) => { console.error(err) })
            });
        }

        // TODO: Handle modern web apps that don't reload the page when new content is loaded (think nextJS & react apps)
        // The issue is that the highlighted content gets lost when new content is loaded, and the line needs to be refreshed to highlight the start of the new content (issue stems from the fact that most code runs when page loads, but new webapps seldom reload page)
        // This should be able to be fixed with a MutationObserver object, listening for changes in the dom, at every change (or some other condition), search the page for more paragraphs and add them into the paragraphs array (will be a tough one to figure out as you have to maintain order of the paragraphs in the array)

    }
});