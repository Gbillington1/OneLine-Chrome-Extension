// function that returns the value of 'currentPage'
function getCurrentPage() {
    let value = new Promise(resolve => {
        chrome.storage.sync.get("currentPage", function (result) {
            resolve(result.currentPage);
        });
    });
    return value;
}

$(document).ready(async function () {
    // get value of current page
    var currentPage = await getCurrentPage();
    
    // only enter if value isn't undefined
    if (currentPage !== undefined) {
        // determine which page to load
        if (currentPage == 'colorOption.html') {
            window.location.href = 'colorOption.html';
        } else if (currentPage == 'textToSpeech.html') {
            window.location.href = 'textToSpeech.html'
        } 
    }

    // if "change color" is clicked, navigate to that page and set it as the current page
    $("#row1").click(function() {
        console.log('here')
        chrome.storage.sync.set({ currentPage: 'colorOption.html' });
        window.location.href = 'colorOption.html'
    })
    
    // if "Text to Speech" is clicked, navigate to that page and set it as the current page
    $("#row2").click(function() {
        chrome.storage.sync.set({ currentPage: 'textToSpeech.html' });
        window.location.href = 'textToSpeech.html'
    })

})

