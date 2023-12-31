// message: { key: value }
export const sendMsgToCS = (message) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

// forwards message to sw.js
export const forwardRequest = (message) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        })
    })
}

export const getValueFromStorage = async (key) => {
    return new Promise((resolve) => {

        chrome.storage.sync.get([key], (data) => {

            resolve(data[key]);

        })

    })
}

export const loadActivePage = async () => {

    getValueFromStorage("activePage").then((activePage) => {

        if (activePage == "colorSettings.html") {
            window.location.href = "colorSettings.html";
        } else if (activePage == "textToSpeech.html") {
            window.location.href = "textToSpeech.html";
        }

    });

}

export const goToDefaultPage = () => {

    chrome.storage.sync.set({ "activePage": "deafultPopup.html" });
    window.location.href = "defaultPopup.html";

}

export const loadOnOffSwitch = async () => {

    const onOffSwitchState = await getValueFromStorage("onOffSwitchState");
    $("#onOffSwitch").prop("checked", onOffSwitchState);

}

export const loadAbionicSwitch = async () => {
    
        const abionicSwitchState = await getValueFromStorage("abionicSwitchState");
        $("#abionicSwitch").prop("checked", abionicSwitchState);
    
}

// For colorSettings.js
export const loadFavoritesFromStorage = async (elem) => {

    let id = $(elem).attr("id");

    // get favoriteIsSet attr from storage and set it to the element
    let isFavSet = await getValueFromStorage(`${id} favIsSet`);
    $(elem).attr("favoriteIsSet", isFavSet);

    // if the favorite is set, get the favorite color from storage and set it to the element
    if ($(elem).attr("favoriteIsSet") == "true") {
        let color = await getValueFromStorage($(elem).attr("id"));
        $(elem).css("background-color", color);
    }

}

export const saveFavoritesToStorage = (activeColor) => {

    let favoriteSet = false;

    $(".favoritesColorBtn").each((i, elem) => {

        // check if the button already contains a favorite color
        if ($(elem).attr("favoriteIsSet") == 'false' && favoriteSet == false) {

            // if it doesn't, add the color to the btn and set the favoriteIsSet attr to true
            $(elem).css("background-color", activeColor);
            $(elem).attr("favoriteIsSet", 'true');

            // save favorite color and favoirteIsSet attr to storage
            chrome.storage.sync.set({ [$(elem).attr("id")]: activeColor });
            chrome.storage.sync.set({ [`${$(elem).attr("id")} favIsSet`]: 'true' });

            favoriteSet = true;

        }

    })
}

// helper function for calculateWordColorWithYIQ, converts colorString to rgb object
const convertToRGB = (colorString) => {
    // returns true if the string is a hex color, false otherwise
    const regex = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$")
    let r, g, b;

    // is hex
    if (regex.test(colorString)) {
        r = parseInt(colorString.slice(1, 3), 16)
        g = parseInt(colorString.slice(3, 5), 16)
        b = parseInt(colorString.slice(5, 7), 16)
        // is rgb
    } else {
        let rgb = colorString.match(/\d+/g);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
    }

    return { r, g, b }
}

export const rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`

// use YIQ to calculate the optimial color of the word (easiest to read) 
export const calculateWordColorWithYIQ = (backgroundColorString) => {
    const rgb = convertToRGB(backgroundColorString);
    const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}