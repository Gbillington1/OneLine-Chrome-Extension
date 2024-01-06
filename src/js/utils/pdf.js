import $ from "jquery";
import {loadHTMLFromStorage} from "./contentScripts";
import {forwardRequest} from "./global";

let prevTarget;

/**
 * Entrypoint for OneLine PDF functionality -- MVP
 * Builds lines on the fly per page when the user hovers over the page
 * When the user hovers over a line, the entire line will highlight
 * Arrow key/Moving line mechanics not yet built
 */
export function startOneLinePDF(activeColor) {
    bindMutationObserver()
    prevTarget = null;
    $("#viewer").mousemove((e) => {
        highlightLineUnderMouse(e, activeColor)
    })
}

/**
 * Function to unbind mousemove event and start OneLine PDF again with new color
 * @param activeColor color of highlight
 */
export function restartOneLinePDF(activeColor) {
    $("#viewer").unbind("mousemove")
    startOneLinePDF(activeColor)
}

/**
 * Builds a map to match each span with a line id that corresponds to the line it is on.
 * This gives us a way to get all spans on a line given a specific line ID
 * @param {Array[HTMLElement]} spans list of spans from pdf
 * @returns {Map} map of line ids to spans
 */
export function buildSpansMap(spans) {
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
export function getPageNumFrom(target) {
    let currentNode = target;
    while (currentNode && currentNode !== document) {
        if (currentNode.classList.contains('page')) {
            return currentNode.getAttribute("data-page-number");
        }
        currentNode = currentNode.parentNode;
    }
    return null; // Return null if no matching div.page found in the DOM hierarchy
}

/**
 * Creates the {@link MutationObserver} object with a callback to call on every DOM mutation that checks if the
 * PDF has a textLayer that we can highlight and loads an HTML alert if the PDF is not supported
 */
function bindMutationObserver() {
    // if we use this, need to disconnect when tab switches away from pdf viewer
    // TODO: Disconnect observer when tab switches away from /view_pdf
    const observer = new MutationObserver((mutations, observer) => {
        for (const record of mutations) {
            // doesn't fully work yet because blank pages in PDF that do have textLayers will pass this if statement
            if (record.type === "childList"
                && record.target.className === "textLayer"
                && record.addedNodes.item(0).className === "endOfContent"
                && record.previousSibling === null
                && $("div.page span:visible").not(".markedContent").length === 0)
            {
                forwardRequest({showUnsupportedPageAlert: true}).then((resp) => {
                    if (resp.showUnsupportedPageAlert) {
                        loadHTMLFromStorage()
                    }
                })
            }
        }
    })
    observer.observe(document.getElementById("viewer"), {childList: true, subtree: true })
}

/**
 * Event handler for the #viewer mousemove
 * Selects all the spans on the page that the user is hovering over, builds a map of lines & line IDs
 * Highlight each line with the active color when the user is hovering over that line
 * @param e mousemove event
 * @param activeColor active color of line from extension popup
 */
function highlightLineUnderMouse(e, activeColor) {
    // populate spans map with spans from page that mouse is over (only store 1 page as hacky optimization)
    let target = e.target
    let pageNum = getPageNumFrom(target)
    let $spans = $("div.page[data-page-number=" + pageNum + "] span:visible").not(".markedContent")
    // show unsupported alert when no spans found
    if ($spans.length === 0) {

    }
    let lineIdToSpans = buildSpansMap($("div.page[data-page-number=" + pageNum + "] span:visible").not(".markedContent"))

    // check for line id on target
    let lineId = target.getAttribute('ol-line-id')

    // remove background red from prevTarget
    // important to do this before returning if no lineId to clear background on all elements
    if (prevTarget !== null && prevTarget.getAttribute('ol-line-id') !== lineId) {
        let prevSpans = lineIdToSpans.get(prevTarget.getAttribute('ol-line-id'))
        if (prevSpans !== undefined) {
            prevSpans.forEach(span => {
                span.style.backgroundColor = ""
            })
        }
    }

    // if line is not target, return
    if (lineId === null) {
        return;
    }

    // use map to get spans from line id
    let spans = lineIdToSpans.get(lineId)

    // background red
    spans.forEach(span => {
        span.style.backgroundColor = activeColor;
    })

    prevTarget = target

}