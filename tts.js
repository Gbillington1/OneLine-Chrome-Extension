// gets rate from storage
function getRate() {
    return new Promise(resolve => {
        chrome.storage.sync.get('rate', function (result) {
            resolve(result.rate)
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
    var rate = await getRate();
    $('#rate').val(rate);
    $('#rateValue').html(rate + 'x');

    $('#rate').change(function () {
        rate = $(this).val()
        chrome.storage.sync.set({ rate: rate });
        $('#rateValue').html(rate + 'x');
    })

    $('#ttsForm').submit(function (e) {
        e.preventDefault();

        // tell CS that the tts should start
        // somehow pass the correct voice over to the CS (along with rate)

        // var utterThis = new SpeechSynthesisUtterance(inputTxt.value);
        var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
        for (i = 0; i < voices.length; i++) {
            if (voices[i].name === selectedOption) {
                chrome.storage.sync.set({ currentVoice: voices[i] })
                // utterThis.voice = voices[i];
            }
        }
        
        sendMsgToCS(0, 'tts started');
        // synth.speak(utterThis);
    })

})