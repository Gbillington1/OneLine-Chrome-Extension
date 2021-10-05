export const sendMsgToCS = (message) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { msg: message });
    });
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