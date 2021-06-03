import { loadActivePage } from './util-functions.js';

loadActivePage();

$(document).ready(() => {

    $('#colorSettings').click(() => {

        chrome.storage.sync.set({ "activePage": "colorSettings.html" })
        window.location.href = "colorSettings.html"
    
    })

    $('#tts').click(() => {
    
        chrome.storage.sync.set({ "activePage": "textToSpeech.html" })
        window.location.href = "textToSpeech.html"
    
    })

})