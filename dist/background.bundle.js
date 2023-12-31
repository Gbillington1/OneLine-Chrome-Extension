/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*********************************!*\
  !*** ./src/js/background/sw.js ***!
  \*********************************/
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
                sendMsgToCS({ onOffSwitchState: true }).catch((err) => { console.error(err) })
            });
        }
    })

    // get the active color, set it to default if there isn't one in storage, tell CS to change the color
    chrome.storage.sync.get("activeColor", function (result) {
        let activeColor = result.activeColor;

        if (activeColor == undefined) {
            activeColor = "#f8fd89";
            chrome.storage.sync.set({ "activeColor": activeColor }, function () {
                sendMsgToCS({ activeColor: activeColor }).catch((err) => { console.error(err) })
            });
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
    tab = await chrome.tabs.get(activeInfo.tabId)
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
                fetch(chrome.runtime.getURL('html/blobs/pageReloadPrompt.html')).then(data => data.text()).then(html => {

                    chrome.scripting.insertCSS({
                        target: { tabId: tab.id },
                        files: ['css/tailwind/out.css']
                    })
                    sendMsgToCS({ "installPopup": html }, tab.id).catch((err) => { console.error(err) })
                    chrome.storage.local.set({ "thankyouTabId": null }) // make sure we don't fire this popup again
                });

            }
        })

        // TODO: Update to prod URL
        if (!tab.url.includes('127.0.0.1:5000/view_pdf?file=') && tab.url.endsWith('.pdf')) {
            fetch(chrome.runtime.getURL('html/blobs/openPDFInOneLinePopup.html')).then(data => data.text()).then(html => {
                chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files: ['css/tailwind/out.css']
                })
                sendMsgToCS({ openPDFPopupHtml: html }, tab.id).catch((err) => { console.error(err) })
            });
        }

        // TODO: Handle modern web apps that don't reload the page when new content is loaded (think nextJS & react apps)
        // The issue is that the highlighted content gets lost when new content is loaded, and the line needs to be refreshed to highlight the start of the new content (issue stems from the fact that most code runs when page loads, but new webapps seldom reload page)
        // This should be able to be fixed with a MutationObserver object, listening for changes in the dom, at every change (or some other condition), search the page for more paragraphs and add them into the paragraphs array (will be a tough one to figure out as you have to maintain order of the paragraphs in the array)

    }
});
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0EsNEJBQTRCLG1DQUFtQztBQUMvRDtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNDQUFzQywwQkFBMEI7QUFDaEUsOEJBQThCLHdCQUF3QixtQkFBbUIsb0JBQW9CO0FBQzdGLGFBQWE7QUFDYjtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxzQ0FBc0MsNEJBQTRCO0FBQ2xFLDhCQUE4QiwwQkFBMEIsbUJBQW1CLG9CQUFvQjtBQUMvRixhQUFhO0FBQ2I7QUFDQSxLQUFLOztBQUVMO0FBQ0EsNkJBQTZCLHVEQUF1RDtBQUNwRjtBQUNBO0FBQ0EsdUNBQXVDLHlCQUF5QjtBQUNoRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLGdDQUFnQywwQ0FBMEM7QUFDMUU7QUFDQSxDQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsbUJBQW1CO0FBQ2hFLGNBQWM7QUFDZDtBQUNBLDZDQUE2QyxjQUFjO0FBQzNEO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLDRDQUE0Qyw0QkFBNEIsR0FBRztBQUN4Ryx1QkFBdUIsNEJBQTRCO0FBQ25EOztBQUVBO0FBQ0EsNkJBQTZCLDREQUE0RDtBQUN6Rix1QkFBdUIsMkJBQTJCO0FBQ2xEOztBQUVBO0FBQ0EsNkJBQTZCLDhEQUE4RDtBQUMzRix1QkFBdUIsbUNBQW1DO0FBQzFEOztBQUVBO0FBQ0E7QUFDQSw0QkFBNEIsb0JBQW9CO0FBQ2hEO0FBQ0E7QUFDQSxpREFBaUQsY0FBYztBQUMvRDtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1QsdUJBQXVCLDJCQUEyQjtBQUNsRDs7QUFFQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0Isa0JBQWtCO0FBQ3hDO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixrQkFBa0I7QUFDaEQ7QUFDQSxxQkFBcUI7QUFDckIsK0JBQStCLCtCQUErQjtBQUM5RDtBQUNBLFNBQVM7QUFDVDtBQUNBLENBQUM7O0FBRUQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQ0FBa0MsZUFBZTtBQUNqRDtBQUNBLHFCQUFxQjtBQUNyQixrQ0FBa0Msc0JBQXNCLDJCQUEyQixvQkFBb0I7QUFDdkcsK0NBQStDLHVCQUF1QjtBQUN0RSxpQkFBaUI7O0FBRWpCO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixlQUFlO0FBQzdDO0FBQ0EsaUJBQWlCO0FBQ2pCLDhCQUE4Qix3QkFBd0IsMkJBQTJCLG9CQUFvQjtBQUNyRyxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsQ0FBQyxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vT25lTGluZS1DaHJvbWUtRXh0ZW5zaW9uLy4vc3JjL2pzL2JhY2tncm91bmQvc3cuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gZ2V0Q3VycmVudFRhYigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCBmdW5jdGlvbiAodGFicykge1xuICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgIHJlamVjdChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRhYnNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2VuZE1zZ1RvQ1MobWVzc2FnZSwgaWQgPSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0YWIgPSBhd2FpdCBnZXRDdXJyZW50VGFiKCk7XG4gICAgICAgIGlkID0gdGFiLmlkO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGlkLCBtZXNzYWdlLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSlcbn1cblxuLy8gbG9hZCBkZWZhdWx0IHN0YXRlcyB0byBzdG9yYWdlIFxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKGRldGFpbHMpIHtcblxuICAgIC8vIGdldCB0aGUgc3d0aWNoIHN0YXRlLCBzZXQgaXQgdG8gdHJ1ZSBpZiBpdCdzIG5vdCBzZXQsIHRlbGwgQ1MgdG8gc3RhcnQgb25lbGluZVxuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFwib25PZmZTd2l0Y2hTdGF0ZVwiLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIGxldCBvbk9mZlN3aXRjaFN0YXRlID0gcmVzdWx0Lm9uT2ZmU3dpdGNoU3RhdGU7XG5cbiAgICAgICAgaWYgKG9uT2ZmU3dpdGNoU3RhdGUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IFwib25PZmZTd2l0Y2hTdGF0ZVwiOiB0cnVlIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZW5kTXNnVG9DUyh7IG9uT2ZmU3dpdGNoU3RhdGU6IHRydWUgfSkuY2F0Y2goKGVycikgPT4geyBjb25zb2xlLmVycm9yKGVycikgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIC8vIGdldCB0aGUgYWN0aXZlIGNvbG9yLCBzZXQgaXQgdG8gZGVmYXVsdCBpZiB0aGVyZSBpc24ndCBvbmUgaW4gc3RvcmFnZSwgdGVsbCBDUyB0byBjaGFuZ2UgdGhlIGNvbG9yXG4gICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoXCJhY3RpdmVDb2xvclwiLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIGxldCBhY3RpdmVDb2xvciA9IHJlc3VsdC5hY3RpdmVDb2xvcjtcblxuICAgICAgICBpZiAoYWN0aXZlQ29sb3IgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBhY3RpdmVDb2xvciA9IFwiI2Y4ZmQ4OVwiO1xuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoeyBcImFjdGl2ZUNvbG9yXCI6IGFjdGl2ZUNvbG9yIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZW5kTXNnVG9DUyh7IGFjdGl2ZUNvbG9yOiBhY3RpdmVDb2xvciB9KS5jYXRjaCgoZXJyKSA9PiB7IGNvbnNvbGUuZXJyb3IoZXJyKSB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKGRldGFpbHMucmVhc29uID09IFwiaW5zdGFsbFwiKSB7XG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogXCJodHRwczovL3VzZW9uZWxpbmUuY29tL3RoYW5reW91L1wiLCBhY3RpdmU6IHRydWUgfSwgZnVuY3Rpb24gKHRhYikge1xuICAgICAgICAgICAgLy8gc2F2ZSB0aGlzIHNwZWNpZmljIElEIHNvIHdlIGNhbiBkZXRlY3QgaW4gaW4gdGhlIG9uVXBkYXRlZCBsaXN0ZW5lclxuICAgICAgICAgICAgLy8gYXZvaWRzIGZpcmluZyB0aGUgb25VcGRhdGVkIGxpc3RlbmVyIHdoZW4gdGhlIHVzZXIgZ29lcyB0byB0aGFuayB5b3Ugb24gdGhlaXIgb3duIChJRCB3aWxsIGJlIGRpZmZlcmVudClcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFwidGhhbmt5b3VUYWJJZFwiOiB0YWIuaWQgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGVsc2UgaWYgKGRldGFpbHMucmVhc29uID09IFwidXBkYXRlXCIpIHtcbiAgICAvLyAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBcImh0dHBzOi8vdXNlb25lbGluZS5jb20vdXBkYXRlcy92MlwiIH0pXG4gICAgLy8gfVxufSlcblxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtc2csIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG5cbiAgICAvLyBmZXRjaCB1c2VyIGZyb20gZmxhc2sgYXBwLCBudWxsIGlmIG5vdCBhdXRoZW50aWNhdGVkXG4gICAgaWYgKG1zZy5nZXRVc2VyKSB7XG4gICAgICAgIGZldGNoKCdodHRwOi8vMTI3LjAuMC4xOjUwMDAvdXNlcmluZm8nKS50aGVuKHJlcyA9PiByZXMuanNvbigpKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEudXNlcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEudXNlcilcbiAgICAgICAgICAgICAgICAvLyBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IFwidXNlclwiOiBkYXRhLnVzZXIgfSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyB1c2VyXCIpXG4gICAgICAgICAgICAgICAgLy8gY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoeyBcInVzZXJcIjogbnVsbCB9KVxuICAgICAgICAgICAgICAgIC8vIHVzZXIgbmVlZHMgdG8gbG9nIGluIHRvIHVzZSBhcHBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBsb2FkIHBkZiByZWFkZXJcbiAgICBpZiAobXNnLnBkZikge1xuICAgICAgICAvLyBUT0RPOiBVcGRhdGUgdG8gcHJvZCBVUkxcbiAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBgaHR0cDovLzEyNy4wLjAuMTo1MDAwL3ZpZXdfcGRmP2ZpbGU9JHtlbmNvZGVVUklDb21wb25lbnQobXNnLnBkZil9YCB9KVxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBvcGVuUERGOiB0cnVlLCBzdGF0dXM6IDIwMCB9KVxuICAgIH1cblxuICAgIGlmIChtc2cuc2lnblVwKSB7XG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogXCJodHRwczovL3VzZW9uZWxpbmUuY29tL25ld3NsZXR0ZXIvc2lnbnVwP3NvdXJjZT1wZGZcIiB9KVxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzaWduVXA6IHRydWUsIHN0YXR1czogMjAwIH0pXG4gICAgfVxuXG4gICAgaWYgKG1zZy5wb3B1cEVtYWlsTGlzdCkge1xuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IFwiaHR0cHM6Ly91c2VvbmVsaW5lLmNvbS9uZXdzbGV0dGVyL3NpZ251cD9zb3VyY2U9cG9wdXBcIiB9KVxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBwb3B1cEVtYWlsTGlzdDogdHJ1ZSwgc3RhdHVzOiAyMDAgfSlcbiAgICB9XG5cbiAgICAvLyByZWxvYWQgYWxsIHBhZ2VzXG4gICAgaWYgKG1zZy5yZWxvYWQpIHtcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoeyBzdGF0dXM6ICdjb21wbGV0ZScgfSwgKHRhYnMpID0+IHtcbiAgICAgICAgICAgIHRhYnMuZm9yRWFjaCgodGFiKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRhYi51cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMudXBkYXRlKHRhYi5pZCwgeyB1cmw6IHRhYi51cmwgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyByZWxvYWQ6IHRydWUsIHN0YXR1czogMjAwIH0pXG4gICAgfVxuXG59KVxuXG4vLyBUYWIgY2hhbmdlOiBGaXJlIHdoZW4gdGFiIGNoYW5nZXMsIG1ha2Ugc3VyZSB0byB3YWl0IGZvciBjb250ZW50IHNjcmlwdCB0byBsb2FkIGJlZm9yZSBzZW5kaW5nIG1lc3NhZ2VcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFzeW5jIChhY3RpdmVJbmZvKSA9PiB7XG4gICAgdGFiID0gYXdhaXQgY2hyb21lLnRhYnMuZ2V0KGFjdGl2ZUluZm8udGFiSWQpXG4gICAgLy8gdGhpcyBmaXJlcyB3aGVuIHRoZSB1c2VyIGdvZXMgdG8gYSB0YWIgdGhhdCB3YXMgYWxyZWFkeSBsb2FkZWRcbiAgICBpZiAodGFiLnVybCkge1xuICAgICAgICBzZW5kTXNnVG9DUyh7IHRhYkNoYW5nZWQ6IHRydWUgfSwgYWN0aXZlSW5mby50YWJJZCkuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSlcbiAgICAvLyB0aGlzIGZpcmVzIHdoZW4gdGhlIHVzZXIgZ29lcyB0byBhIHRhYiB0aGF0IGhhc24ndCBiZWVuIGxvYWRlZCB5ZXQgKG5vIFVSTCBzZXQgb24gdGFiKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHdhaXQgZm9yIGNvbnRlbnQgc2NyaXB0IHRvIHNlbmQgbG9hZGVkIG1lc3NhZ2VcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGFzeW5jIChtc2csIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBpZiAobXNnLnBhZ2VMb2FkZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBzZW5kTXNnVG9DUyh7IHRhYkNoYW5nZWQ6IHRydWUgfSwgYWN0aXZlSW5mby50YWJJZCkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHBhZ2VMb2FkZWQ6IHRydWUsIHN0YXR1czogMjAwIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxufSk7XG5cbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xuXG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09IFwiY29tcGxldGVcIiAmJiB0YWIudXJsKSB7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgd2UncmUgb24gdGhlIHRoYW5rIHlvdSBwYWdlID0+IHNob3cgdGhlIHJlbG9hZCBwb3B1cFxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoXCJ0aGFua3lvdVRhYklkXCIsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS50aGFua3lvdVRhYklkID09IHRhYklkKSB7XG4gICAgICAgICAgICAgICAgZmV0Y2goY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdodG1sL2Jsb2JzL3BhZ2VSZWxvYWRQcm9tcHQuaHRtbCcpKS50aGVuKGRhdGEgPT4gZGF0YS50ZXh0KCkpLnRoZW4oaHRtbCA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5pbnNlcnRDU1Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWIuaWQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbJ2Nzcy90YWlsd2luZC9vdXQuY3NzJ11cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgc2VuZE1zZ1RvQ1MoeyBcImluc3RhbGxQb3B1cFwiOiBodG1sIH0sIHRhYi5pZCkuY2F0Y2goKGVycikgPT4geyBjb25zb2xlLmVycm9yKGVycikgfSlcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgXCJ0aGFua3lvdVRhYklkXCI6IG51bGwgfSkgLy8gbWFrZSBzdXJlIHdlIGRvbid0IGZpcmUgdGhpcyBwb3B1cCBhZ2FpblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gVE9ETzogVXBkYXRlIHRvIHByb2QgVVJMXG4gICAgICAgIGlmICghdGFiLnVybC5pbmNsdWRlcygnMTI3LjAuMC4xOjUwMDAvdmlld19wZGY/ZmlsZT0nKSAmJiB0YWIudXJsLmVuZHNXaXRoKCcucGRmJykpIHtcbiAgICAgICAgICAgIGZldGNoKGNocm9tZS5ydW50aW1lLmdldFVSTCgnaHRtbC9ibG9icy9vcGVuUERGSW5PbmVMaW5lUG9wdXAuaHRtbCcpKS50aGVuKGRhdGEgPT4gZGF0YS50ZXh0KCkpLnRoZW4oaHRtbCA9PiB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5pbnNlcnRDU1Moe1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYi5pZCB9LFxuICAgICAgICAgICAgICAgICAgICBmaWxlczogWydjc3MvdGFpbHdpbmQvb3V0LmNzcyddXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBzZW5kTXNnVG9DUyh7IG9wZW5QREZQb3B1cEh0bWw6IGh0bWwgfSwgdGFiLmlkKS5jYXRjaCgoZXJyKSA9PiB7IGNvbnNvbGUuZXJyb3IoZXJyKSB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBIYW5kbGUgbW9kZXJuIHdlYiBhcHBzIHRoYXQgZG9uJ3QgcmVsb2FkIHRoZSBwYWdlIHdoZW4gbmV3IGNvbnRlbnQgaXMgbG9hZGVkICh0aGluayBuZXh0SlMgJiByZWFjdCBhcHBzKVxuICAgICAgICAvLyBUaGUgaXNzdWUgaXMgdGhhdCB0aGUgaGlnaGxpZ2h0ZWQgY29udGVudCBnZXRzIGxvc3Qgd2hlbiBuZXcgY29udGVudCBpcyBsb2FkZWQsIGFuZCB0aGUgbGluZSBuZWVkcyB0byBiZSByZWZyZXNoZWQgdG8gaGlnaGxpZ2h0IHRoZSBzdGFydCBvZiB0aGUgbmV3IGNvbnRlbnQgKGlzc3VlIHN0ZW1zIGZyb20gdGhlIGZhY3QgdGhhdCBtb3N0IGNvZGUgcnVucyB3aGVuIHBhZ2UgbG9hZHMsIGJ1dCBuZXcgd2ViYXBwcyBzZWxkb20gcmVsb2FkIHBhZ2UpXG4gICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGFibGUgdG8gYmUgZml4ZWQgd2l0aCBhIE11dGF0aW9uT2JzZXJ2ZXIgb2JqZWN0LCBsaXN0ZW5pbmcgZm9yIGNoYW5nZXMgaW4gdGhlIGRvbSwgYXQgZXZlcnkgY2hhbmdlIChvciBzb21lIG90aGVyIGNvbmRpdGlvbiksIHNlYXJjaCB0aGUgcGFnZSBmb3IgbW9yZSBwYXJhZ3JhcGhzIGFuZCBhZGQgdGhlbSBpbnRvIHRoZSBwYXJhZ3JhcGhzIGFycmF5ICh3aWxsIGJlIGEgdG91Z2ggb25lIHRvIGZpZ3VyZSBvdXQgYXMgeW91IGhhdmUgdG8gbWFpbnRhaW4gb3JkZXIgb2YgdGhlIHBhcmFncmFwaHMgaW4gdGhlIGFycmF5KVxuXG4gICAgfVxufSk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9