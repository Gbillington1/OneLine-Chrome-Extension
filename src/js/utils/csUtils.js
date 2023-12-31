import $ from 'jquery';



// updates the css varible that holds the line color,
export function updateLineColor(color) {
    document.documentElement.style.setProperty("--oneline-active-color", color);
};



// async function to update line color & start oneline if switch is set to true, else stops oneline
export async function handleTabChange(onOffSwitchState, activeColor, ol) {
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

export function startOneLinePDF() {
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

// FROM SPLITTING.JS
// TODO: Try to find a way to use this functionality from Splitting rather than copying the functions over
// I use the splitText function in my custom plugin, so maybe the root problem is that and there is a better way to split
/**
 * A for loop wrapper used to reduce js minified size.
 * @param {!Array<T>} items
 * @param {function(T):void} consumer
 * @template T
 */
function each(items, consumer) {
    items && items.some(consumer);
}

/**
 *
 * @param {!HTMLElement} parent
 * @param {string} key
 * @param {string} text
 * @param {boolean} whitespace
 */
function createElement(parent, key, text, whitespace) {
    var el = document.createElement('span');
    key && (el.className = key);
    if (text) {
        !whitespace && el.setAttribute("data-" + key, text);
        el.textContent = text;
    }
    return (parent && parent.appendChild(el)) || el;
}

/**
 * # Splitting.split
 * Split an element's textContent into individual elements
 * @param {!HTMLElement} el  Element to split
 * @param {string} key
 * @param {string} splitOn
 * @param {boolean} includePrevious
 * @param {boolean} preserveWhitespace
 * @return {!Array<!HTMLElement>}
 */
export function splitText(el, key, splitOn, includePrevious, preserveWhitespace) {
    // Combine any strange text nodes or empty whitespace.

    el.normalize();

    // Use fragment to prevent unnecessary DOM thrashing.
    var elements = [];
    var F = document.createDocumentFragment();

    if (includePrevious) {
        elements.push(el.previousSibling);
    }

    var allElements = [];

    // handles text that is wrapped in tags like <b> or <sup>
    Array.from(el.childNodes).some(function(next) {
        if (next.tagName && !next.hasChildNodes()) {
            // keep elements without child nodes (no text and no children)
            allElements.push(next);
            return;
        }
        // Recursively run through child nodes
        if (next.childNodes && next.childNodes.length) {
            // push html els that have child nodes and have a child node length > 0
            allElements.push(next);
            elements.push.apply(elements, splitText(next, key, splitOn, includePrevious, preserveWhitespace));
            return;
        }

        // Get the text to split, trimming out the whitespace
        /** @type {string} */
        var wholeText = next.wholeText || '';
        var contents = wholeText.trim();

        // If there's no text left after trimming whitespace, continue the loop
        if (contents.length) {
            // insert leading space if there was one
            if (wholeText[0] === ' ') {
                allElements.push(createElement(F, "whitespace", " ", preserveWhitespace));
            }
            // Concatenate the split text children back into the full array
            each(contents.split(splitOn), function(splitText, i) {
                if (i && preserveWhitespace) {
                    allElements.push(createElement(F, "whitespace", " ", preserveWhitespace));
                }
                var splitEl = createElement(F, key, splitText);
                elements.push(splitEl);
                allElements.push(splitEl);
            });
            // insert trailing space if there was one
            if (wholeText[wholeText.length - 1] === ' ') {
                allElements.push(createElement(F, "whitespace", " ", preserveWhitespace));
            }
        }
    });

    each(allElements, function(el) {
        F.appendChild(el)
    });

    // Clear out the existing element
    el.innerHTML = "";
    el.appendChild(F)
    return elements;
}