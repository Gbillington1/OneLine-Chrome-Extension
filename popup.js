// function storeUserPrefs() {
//     chrome.storage.sync.set({isHighlighting: highlightedCheckBoxVal}, function() {
//         console.log("saved " + isHighlighting + "as " + highlightedCheckBoxVal);
//     })
// }

// function getUserPrefs() {
//     chrome.storage.sync.get(['isHighlighting'], function(result) {
//         $("#highlightedCheckbox").prop('checked', result.isHighlighting)
//         console.log('Value currently is ' + result.isHighlighting);
//       });
//     }

// getUserPrefs();
var highlightedCheckBoxVal = $("#highlightedCheckbox").prop("checked");

function getAsync(valueToGet) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(valueToGet, (value) => {
            resolve(value);
        })
    })
}

//returns {object, object} - I want it to return true or false
$(document).keyup(async function (e) {
    if (e.keyCode == 120) {
        var value = await getAsync("highlightedCheckBoxVal");
        alert(value);
    }
})
