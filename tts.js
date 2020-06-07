function getRate() {
    return new Promise(resolve => {
        chrome.storage.sync.get('rate', function(result) {
            resolve(result.rate)
        })
    })
}


$(document).ready(async function () {

    // set the currentPage to defaultPopup when the back button is clicked
    $('#backLink').click(function () {
        chrome.storage.sync.set({ currentPage: 'defaultPopup.html' });
    })

    // populate voices
    var synth = window.speechSynthesis;
    var select = $('#select')

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
            select.append(option);
        }
    }

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    var rate = await getRate();
    $('#rate').val(rate);
    $('#rateValue').html(rate + 'x');
    console.log('set')

    $('#rate').change(function() {
        rate = $(this).val()
        chrome.storage.sync.set({ rate: rate });
        $('#rateValue').html(rate + 'x');
    })

})