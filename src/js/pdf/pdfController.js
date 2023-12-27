// TODO: add checks/error handling for PDFs that don't have the option for a textLayer

import {
    sendMsgToCS,
} from '../popup/util-functions.js';

let url = window.location.href.split('=')[1];

// Loaded via <script> tag, create shortcut to access PDF.js exports.
let pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('/js/libraries/pdf.worker.js');

let pdfDoc = null,
    currPage = 1, //pages start at 1
    numPages = 0,
    scale = 1,
    container = document.getElementById('content')

function startOneLinePDF() {

    let lineIdToSpans = buildSpansMap($('span'))

    let prevTarget = null;
    $("#content").mousemove(function(e) {

        let target = e.target
        // check for line id on target
        let lineId = target.getAttribute('ol-line-id')

        if (lineId === null) {
            return;
        }

        // use map to get spans from line id
        let spans = lineIdToSpans.get(lineId)
        // background red
        spans.forEach(span => {
            span.style.backgroundColor = "red"
        })

        // remove background red from prevTarget
        if (prevTarget !== null && prevTarget.getAttribute('ol-line-id') !== lineId) {
            let prevSpans = lineIdToSpans.get(prevTarget.getAttribute('ol-line-id'))
            prevSpans.forEach(span => {
                span.style.backgroundColor = ""
            })
        }

        prevTarget = target

    })

}

/**
 * Builds a map to match each span with a line id that corresponds to the line it is on.
 * This gives us a way to get all spans on a line given a specific line ID
 * @param {Array[HTMLElement]} spans, array of all spans on the page
 * @returns {Map} map of line ids to spans
 */
function buildSpansMap(spans) {
    let map = new Map();
    let currLine = [];
    let prevTop = null;
    let currTop = 0;

    // loop through all spans and group them by line
    $(spans).each(function(i, span) {

        // if spans on same line, assign id and add to currLine
        currTop = $(span).css('top').slice(0, -2);
    
        if (currTop === prevTop) {
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
    });

    // Add the last line to the map
    if (currLine.length > 0) {
        map.set("ol-" + map.size, currLine);
    }

    return map;
}


function handlePages(page) {
    // get viewport of page at given scale
    let viewport = page.getViewport({ scale: scale });
    $("#zoom-value").text(`${Math.round(scale * 100)}%`)

    // create canvas to render page to
    let pageContainer = document.createElement('div');
    $(pageContainer).addClass('page py-2');
    pageContainer.id = `page-${currPage}`;

    let canvas = document.createElement('canvas');
    $(canvas).addClass('pdf-canvas block');

    // create textLayer to render text content to
    let textLayer = document.createElement('div');
    $(textLayer).addClass('textLayer');

    // set the canvas height and width to that of the page
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // render page
    let renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
    };

    page.render(renderContext)

    // add page and textLayer to DOM
    pageContainer.appendChild(canvas);
    pageContainer.appendChild(textLayer);
    container.appendChild(pageContainer);

    // get text content and render it to the textLayer
    page.getTextContent().then(function (textContent) {

        textLayer.style.left = canvas.offsetLeft + 'px';
        textLayer.style.top = canvas.offsetTop + 'px';
        textLayer.style.height = canvas.offsetHeight + 'px';
        textLayer.style.width = canvas.offsetWidth + 'px';

        pdfjsLib.renderTextLayer({
            textContent: textContent,
            container: textLayer,
            viewport: viewport,
            textDivs: []
        });
    }).then(function () {

        // fires when the after the last page is rendered
        if (pageContainer.id.includes(numPages)) {
            console.log("done rendering")
            startOneLinePDF();

        }
    })

    currPage++;
    if (pdfDoc !== null && currPage <= numPages) {
        pdfDoc.getPage(currPage).then(handlePages);
    }
}

/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    numPages = pdfDoc.numPages;
    pdfDoc.getPage(1).then(handlePages)
})



// very inefficient, but it works for now
$("#zoom-in").click(function () {
    scale += 0.1;
    container.innerHTML = '';
    currPage = 1;
    pdfDoc.getPage(1).then(handlePages)
})

$("#zoom-out").click(function () {
    scale -= 0.1;
    container.innerHTML = '';
    currPage = 1;
    pdfDoc.getPage(1).then(handlePages)
})
