$(document).ready(function () {

    // set the currentPage to defaultPopup when the back button is clicked
    $('#backLink').click(function () {
        chrome.storage.sync.set({ currentPage: 'defaultPopup.html' });
    })
})