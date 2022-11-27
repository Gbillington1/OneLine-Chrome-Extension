// TODO: add checks/error handling for PDFs that don't have the option for a textLayer

let url = window.location.href.split('=')[1];

// Loaded via <script> tag, create shortcut to access PDF.js exports.
let pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('/js/libraries/pdf.worker.js');

let pdfDoc = null,
    currPage = 1, //pages start at 1
    numPages = 0,
    scale = 1

function handlePages(page) {
    // get viewport of page at given scale
    let viewport = page.getViewport({ scale: scale });

    // create canvas to render page to
    let canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.className='pdf-canvas';
    canvas.id = 'page-' + currPage;

    // create textLayer to render text content to
    let textLayer = document.createElement('div');
    textLayer.className = 'textLayer';
    textLayer.id = 'textLayer-' + currPage;

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
    document.body.appendChild(canvas);
    document.body.appendChild(textLayer);

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
        console.log(child)
        child.style.backgroundColor = "red";

        // fires when the page is rendered
        if (textLayer.id.includes(numPages)) {
            // send message to extension to start OneLine on the PDF
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