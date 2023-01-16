// bind mutation observer to the success response div so on success we can set the emailSignUp to true
let target = document.getElementById('mce-success-response')

new MutationObserver(() => {
    chrome.storage.sync.set({ "emailSignUp": true })
}).observe(target, {
    attributes: true,
    childList: true,
    characterData: true,
})