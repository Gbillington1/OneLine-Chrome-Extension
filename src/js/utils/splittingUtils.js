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
    Array.from(el.childNodes).some(function (next) {
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
            each(contents.split(splitOn), function (splitText, i) {
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

    each(allElements, function (el) {
        F.appendChild(el)
    });

    // Clear out the existing element
    el.innerHTML = "";
    el.appendChild(F)
    return elements;
}