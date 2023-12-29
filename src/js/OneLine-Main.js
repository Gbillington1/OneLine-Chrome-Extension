// UTIL FUNCTIONS
const getValueFromStorage = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data[key]);
            }
        })
    })
}

// updates the css varible that holds the line color,
const updateLineColor = (color) => {
    document.documentElement.style.setProperty("--oneline-active-color", color);
};

function forwardRequest(message) {
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

// async function to update line color & start oneline if switch is set to true, else stops oneline 
async function handleTabChange(onOffSwitchState, activeColor, ol) {
// returns the current state of the switch so it can be set in the message event listener 
    onOffSwitchState = await getValueFromStorage("onOffSwitchState");

    if (onOffSwitchState === true && !location.href.endsWith('.pdf')) {
        activeColor = await getValueFromStorage("activeColor");
        updateLineColor(activeColor);
        ol.start();
    } else if (onOffSwitchState === false) {
        ol.stop();
    }

    return onOffSwitchState; // return current state of switch
}

function startOneLinePDF() {
    let prevTarget = null;
    $("#viewer").mousemove(function(e) {

        // populate spans map with spans from page that mouse is over (only store 1 page as hacky optimization)
        let target = e.target
        let pageNum = getPageNumFrom(target)
        let lineIdToSpans = buildSpansMap($("div.page[data-page-number=" + pageNum + "] span:visible").not(".markedContent"))

        // check for line id on target
        let lineId = target.getAttribute('ol-line-id')

        // remove background red from prevTarget
        // important to do this before returning if no lineId to clear background on all elements
        if (prevTarget !== null && prevTarget.getAttribute('ol-line-id') !== lineId) {
            let prevSpans = lineIdToSpans.get(prevTarget.getAttribute('ol-line-id'))
            prevSpans.forEach(span => {
                span.style.backgroundColor = ""
            })
        }

        // if line is not target, return
        if (lineId === null) {
            return;
        }

        // use map to get spans from line id
        let spans = lineIdToSpans.get(lineId)

        // background red
        spans.forEach(span => {
            span.style.backgroundColor = "red"
        })

        prevTarget = target

    })
}

/**
 * Builds a map to match each span with a line id that corresponds to the line it is on.
 * This gives us a way to get all spans on a line given a specific line ID
 * @param {Array[HTMLElement]} spans list of spans from pdf
 * @returns {Map} map of line ids to spans
 */
function buildSpansMap(spans) {
    let map = new Map();
    let currLine = [];
    let prevTop = null;
    let prevBot = null;
    let currMid = null;
    let currTop = 0;

    // loop through all spans and group them by line
    $(spans).each(function(i, span) {

        // Calulate the middle of the current span
        currTop = parseInt($(span).css('top').slice(0, -2));
        currMid = currTop + ($(span).outerHeight() / 2)

        // if the middle of the current span is in the line range of previous span, save it to currLine
        if (currMid >= prevTop && currMid <= prevBot) {
            $(span).attr('ol-line-id', "ol-" + map.size)
            currLine.push(span);

            // if spans on different line, add currLine to map and start new line
        } else {

            if (currLine.length > 0)
                map.set("ol-" + map.size, currLine);

            currLine = [];
            $(span).attr('ol-line-id', "ol-" + map.size)
            currLine.push(span);
        }
        prevTop = currTop;
        prevBot = currTop + $(span).outerHeight();
    });

    // Add the last line to the map
    if (currLine.length > 0) {
        map.set("ol-" + map.size, currLine);
    }

    return map;
}

/**
 * Find parent with class page from given target. Moves through DOM tree until div found, page number is returned
 * @param target
 * @returns {null|string}
 */
function getPageNumFrom(target) {
    let currentNode = target;
    while (currentNode && currentNode !== document) {
        if (currentNode.classList.contains('page')) {
            return currentNode.getAttribute("data-page-number");
        }
        currentNode = currentNode.parentNode;
    }
    return null; // Return null if no matching div.page found in the DOM hierarchy
}


// PROGRAM LOGIC STARTS HERE

// TODO: Design and implement better auto scroll UI/UX
// TODO: add error handling UX for when oneline finds no text/paragraphs
// TODO: double check everything for Mv3
// OPTIONAL: selection feature for p, headers, code, lists, etc
window.onload = async function () {

    // forwardRequest({ getUser: true })

    // create the OneLine instance
    let onOffSwitchState = await getValueFromStorage("onOffSwitchState");
    let ol = OneLine(onOffSwitchState)
    let abionicSwtichState = await getValueFromStorage("abionicSwitchState");
    let activeColor = await getValueFromStorage("activeColor");

    // don't start OneLine on pdf pages
    if (!location.href.endsWith('.pdf')) {

        // start OneLine if switch is set to true
        // maybe add a check here to see if the current page is valid for OneLin

        if (onOffSwitchState === true) {
            updateLineColor(activeColor);
            ol.start();
        }

        if (abionicSwtichState === true) {
            ol.toggleAbionic();
            if (onOffSwitchState === true) {
                ol.resize();
            }
        }
    } else {
        // if we are on the OneLine PDF viewer page
        if (location.href.includes("/view_pdf?file")) {
            startOneLinePDF()
            console.log("VIEWING PDF WOO")
        } else {
            openPDFView = confirm("Open PDF in OneLine?")
            if (openPDFView) {
                forwardRequest({ pdf: window.location.href })
            }
        }
    }

    // listen for changes in the switch state
    // TODO: make sure all message passing is working with manifest v3
    chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {

        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
        }

        if (msg.tabChanged === true) {
            handleTabChange(onOffSwitchState, activeColor, ol).then((result) => {
                onOffSwitchState = result; // refresh the state of the switch on tab change
            })
            sendResponse({ complete: true, status: 200 }) // this line can't be in the .then() block or else it wont send a reponse back to the service worker
        }

        if (msg.onOffSwitchState === true) {
            onOffSwitchState = msg.onOffSwitchState
            activeColor = await getValueFromStorage("activeColor");
            updateLineColor(activeColor);
            ol.start()
            sendResponse({ complete: true, status: 200 })
        }

        if (msg.onOffSwitchState === false) {
            onOffSwitchState = msg.onOffSwitchState
            ol.stop();
            sendResponse({ complete: true, status: 200 })
        }

        if (msg.abionicSwitchState === true) {
            abionicSwtichState = msg.abionicSwitchState
            onOffSwitchState = await getValueFromStorage("onOffSwitchState");
            if (onOffSwitchState === true) {
                activeColor = await getValueFromStorage("activeColor");
                updateLineColor(activeColor)
                ol.clearPage();
                ol.start()
                ol.toggleAbionic()
                ol.resize()
            } else if (onOffSwitchState === false) {
                ol.toggleAbionic()
            }
            sendResponse({ complete: true, status: 200 })
        }

        if (msg.abionicSwitchState === false) {
            abionicSwtichState = msg.abionicSwitchState
            onOffSwitchState = await getValueFromStorage("onOffSwitchState");
            if (onOffSwitchState === true) {
                activeColor = await getValueFromStorage("activeColor");
                updateLineColor(activeColor)
                ol.clearPage();
                ol.toggleAbionic()
                ol.start()
                // ol.resize()
            } else if (onOffSwitchState === false) {
                ol.toggleAbionic()
            }
            sendResponse({ complete: true, status: 200 })
        }

        if (msg.activeColor && msg.activeColor.includes('#')) {
            activeColor = msg.activeColor
            updateLineColor(activeColor);
            if (onOffSwitchState === true) {
                ol.start()
            }
            sendResponse({ complete: true, status: 200 })
        }

        // insert pdf coming soon html into default chrome pdf viewer
        if (msg.html) {
            ol.stop()
            document.body.insertAdjacentHTML('beforeend', msg.html);
            // forward request to background script to send user to mailing list sign up
            $("#ol-signUp").click(() => forwardRequest({ signUp: true }))

            // close the coming soon modal
            $("#ol-dismiss").click(() => {
                $('#oneline-pdf-coming-soon').remove();
            })

            // close the coming soon modal and never show it again
            $("#ol-dismiss-forever").click(() => {
                $('#oneline-pdf-coming-soon').remove();
                forwardRequest({ showPDFPopup: false })
            })

            // $('#oneline-open-pdf-btn').click(() => chrome.runtime.sendMessage({ pdf: window.location.href }));
            sendResponse({ complete: true, status: 200 })
        }

        // load popup that prompts user to reload pages to start OneLine
        if (msg.installPopup) {
            document.body.insertAdjacentHTML('beforeend', msg.installPopup);
            $('#ol-reload-btn').click(() => forwardRequest({ reload: true }));
            $('#ol-close-btn').click(() => $('#ol-reload-page-prompt').remove());
            sendResponse({ complete: true, status: 200 })
        }

        /* 
        TODO: Think about if I should use OneLine to control TTS, or if I should use and TTS controller and instanciate it here
        
        for TTS, listen for "tts start", "tts pause/play", and "tts stop" in here
            case "tts start":
                ol.startTTS(); // starts on current line, feeds utterance instance a line array (see project in documents folder)
                break;
            case "tts pause/play":
                ol.togglePauseTTS(); // pauses/plays current utterance instance
                break;
            case "tts stop":
                ol.stopTTS(); // stops and clears current utterance instance
 
        */

        // indicate that response will be sent asynchronously
        return true
    })

    // resize lines
    // this fires on pdf pages and throws an error because we don't have pdf support yet
    $(window).resize(() => {
        if (onOffSwitchState === true && !location.href.endsWith('.pdf')) {
            ol.resize();
        }
    });

    // todo: add more methods for moving the line (scroll, mouse, clicking on lines/paragraphs)
    $(document).keydown(function (e) {
        // don't move line when user is editing text in <input> or <textarea> 
        if (!$(e.target).is("input, textarea") && onOffSwitchState) {

            // up arrow pressed
            if (e.keyCode == 38) {

                e.preventDefault();
                ol.moveLine("up");

                // down arrow pressed
            } else if (e.keyCode == 40) {

                e.preventDefault();
                ol.moveLine("down");

            }

        }
    });

    forwardRequest({ pageLoaded: true })
}