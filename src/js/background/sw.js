import { sendMsgToCS } from "../utils/global";
import {
    initActiveColor,
    initOnOffSwitchState,
    handleReason,
    loadHTMLBlob,
    setupUniqueThankyouLink,
    handleFetchUser,
    handleUniqueThankyouVisit
} from "../utils/sw";

// load default states to storage
chrome.runtime.onInstalled.addListener(function (details) {
    initOnOffSwitchState();
    initActiveColor()
    handleReason(details)
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    // open login page when connect button clicked in popup
    if (msg.connectAccBtnClicked) {
        const thankyouURL = setupUniqueThankyouLink()
        chrome.tabs.create({ url: `${process.env.API_HOST}/login?next=${thankyouURL}`, active: true })
    }

    // fetch user from flask app, null if not authenticated
    if (msg.fetchUser) {
        handleFetchUser(sendResponse)
    }

    // load pdf reader
    if (msg.pdf) {
        // TODO: Update to prod URL
        chrome.tabs.create({url: `${process.env.API_HOST}/view_pdf?file=${encodeURIComponent(msg.pdf)}`})
        sendResponse({openPDF: true, status: 200})
    }

    if (msg.signUp) {
        chrome.tabs.create({url: "https://useoneline.com/newsletter/signup?source=pdf"})
        sendResponse({signUp: true, status: 200})
    }

    if (msg.popupEmailList) {
        chrome.tabs.create({url: "https://useoneline.com/newsletter/signup?source=popup"})
        sendResponse({popupEmailList: true, status: 200})
    }

    // reload all pages
    if (msg.reload) {
        chrome.tabs.query({status: 'complete'}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url) {
                    chrome.tabs.update(tab.id, {url: tab.url});
                }
            });
        });
        sendResponse({reload: true, status: 200})
    }

    // allow async calls
    return true
})

// Tab change: Fire when tab changes, make sure to wait for content script to load before sending message
// TODO: Update this method of waiting for page to load, having two chrome.runtime.onMessage listeners seems like a very bad idea
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
    return true
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (changeInfo.status == "complete" && tab.url) {

        // if logout page is hit, clear user from storage
        if (tab.url.includes(`${process.env.API_HOST}/logout`)) {
            chrome.storage.sync.set({ "user": null, "activePage": "signUpBlocker.html" })
        } else if (tab.url.includes("useoneline.com/thankyou?time_id")) {
            handleUniqueThankyouVisit(tab)
        } else if (!tab.url.includes(`${process.env.API_HOST}/view_pdf?file=`) && tab.url.endsWith('.pdf')) {
            loadHTMLBlob('dist/html/blobs/openPDFInOneLinePopup.html', tab.id, "openPDF")
        }
        // TODO: Handle modern web apps that don't reload the page when new content is loaded (think nextJS & react apps)
        // The issue is that the highlighted content gets lost when new content is loaded, and the line needs to be refreshed to highlight the start of the new content (issue stems from the fact that most code runs when page loads, but new webapps seldom reload page)
        // This should be able to be fixed with a MutationObserver object, listening for changes in the dom, at every change (or some other condition), search the page for more paragraphs and add them into the paragraphs array (will be a tough one to figure out as you have to maintain order of the paragraphs in the array)
    }
});