// universal function to return values from chrome storage
function getVal(value) {
    return new Promise(resolve => {
        chrome.storage.sync.get([value], result => {
            resolve(result[value]);
        })
    })
}

// function to easily send messages to CS 
function sendMsgToCS(tabNumber, message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[tabNumber].id, { msg: message });
    });
}

$(document).ready(async function () {

    // set the currentPage to defaultPopup when the back button is clicked
    $('#backLink').click(function () {
        chrome.storage.sync.set({ currentPage: 'defaultPopup.html' });
    })

    // populate voices
    var synth = window.speechSynthesis;

    var voiceSelect = document.querySelector('select');

    var voices = [];

    var voiceIndex;

    // find selected voice - returns index
    function findSelectedVoice(selectEl) {
        var selectedOption = selectEl.selectedOptions[0].getAttribute('data-name');
        for (i = 0; i < voices.length; i++) {
            if (voices[i].name === selectedOption) {
                return i;
            }
        }
    }

    function populateVoiceList() {
        voices = synth.getVoices();

        for (i = 0; i < voices.length; i++) {
            var option = document.createElement('option');
            option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

            if (voices[i].default) {
                option.textContent += ' -- DEFAULT';
            }

            option.setAttribute('data-lang', voices[i].lang);
            option.setAttribute('data-name', voices[i].name);
            voiceSelect.appendChild(option);
        }
    }

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // save/update rate on change
    var rate = await getVal("rate");
    $('#rate').val(rate);
    $('#rateValue').html(rate + 'x');

    $('#rate').change(function () {
        rate = $(this).val()
        chrome.storage.sync.set({ rate: rate });
        $('#rateValue').html(rate + 'x');
    })

    // load selected index from storage and set it in the dropdown 
    voiceIndex = await getVal("currentVoice");
    $('#select').get(0).selectedIndex = voiceIndex;

    // save selected index on change
    $('#select').change(function () {
        voiceIndex = findSelectedVoice(voiceSelect);
        chrome.storage.sync.set({ currentVoice: voiceIndex })
    })

    // on submit, send message
    $('#start').click(function (e) {
        e.preventDefault();

        sendMsgToCS(0, 'tts started');
    })

    $('#pause').click(function(e) {
        e.preventDefault();

        sendMsgToCS(0, 'play/pause');
    })

    $('#stop').click(function(e) {
        e.preventDefault();

        sendMsgToCS(0, 'stopped');
    })

})