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
    $('.textLayer span:visible').each(function(i, elem) {
    })

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
        let child = $(textLayer).find('span')[2]
        child.style.backgroundColor = "red";

        // fires when the after the last page is rendered
        if (pageContainer.id.includes(numPages)) {
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
