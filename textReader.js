//gets boolean value of switch from chrome storage
function getOnOffValue() {
  let value = new Promise((resolve) => {
    chrome.storage.sync.get("highlightedSwitch", function (result) {
      resolve(result.highlightedSwitch);
    });
  });
  return value;
}

// gets the current rgb value of the line 
function getRBGValue() {
  let value = new Promise((resolve) => {
    chrome.storage.sync.get("highlightedRgbVal", function (result) {
      resolve(result.highlightedRgbVal);
    });
  });
  return value;
}

// updates the color of the line
function updateBG(valueToSet) {
  document.documentElement.style.setProperty("--background", valueToSet);
}

// determines text color based on the color of the line (takes an array)
function textColor(bgColor) {
  var r = bgColor[0],
    g = bgColor[1],
    b = bgColor[2];
  var yiq = ((r * 0.299) + (g * 0.587) + (b * 0.114));
  return (yiq >= 135) ? 'black' : 'white';
}

// globals

// indecies 
var index = 0;
var paraIndex = 0;

// arrays 
var wordsInSpan = [];
var line = [];
var paras = [];
var lineOffsetsTop = [];
var lineOffsetsBottom = [];
var differences = [];
var lineMedians = [];
var allParas;
var currentHighlighter // color of line (split up)

// booleans
var hasRan = false;
var checkedForEmptyParas = false;
var onOffVal;
var resize = false;

// vars for scrolling
var bottomOfScreen = $(window).scrollTop() + window.innerHeight;
var topOfScreen = $(window).scrollTop();


// vars about the words

// offsets
var currentWordTop;
var currentWordBottom;
var previousWordTop;

// other vars
var lineHeight;
var highlightedRgbVal; // color of the line
var colorToChangeTo;
var currentLine;

window.onload = async function () {

  //get current state of switch
  onOffVal = await getOnOffValue();

  //logic to run program when switch is on/off/changed

  // if switch is on, run program and listen for changes on the switch
  if (onOffVal) {
    runProgram();
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request.msg == "changed to true") {
        runProgram();
      } else if (request.msg == "changed to false") {
        resetProgram();
      }
    });
    // if switch is off, listen for changes on the switch
  } else {
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request.msg == "changed to true") {
        runProgram();
      } else if (request.msg == "changed to false") {
        resetProgram();
      }
    });
  }

  // listen for tab change
  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if (request.msg == 'tab changed') {
      // get the on/off value
      onOffVal = await getOnOffValue();
      // if switch is on, and the program hasn't ran => run the program
      if (onOffVal) {
        if (hasRan == false) {
          runProgram();
        }
        // if switch is off, reset the program
      } else {
        resetProgram();
      }
    }
  });

  // runs the program
  async function runProgram() {

    // program hasn't checkef for empty paras
    checkedForEmptyParas = false;

    // update color of line and text
    highlightedRgbVal = await getRBGValue();
    updateBG(highlightedRgbVal);

    currentHighlighter = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
    colorToChangeTo = textColor(currentHighlighter);

    // listen for changed in RGB and tab changes => update color of line and text
    chrome.runtime.onMessage.addListener(async function (
      request,
      sender,
      sendResponse
    ) {
      if (request.msg == "RBG changed") {
        highlightedRgbVal = await getRBGValue();
        updateBG(highlightedRgbVal);
        currentHighlighter = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
        colorToChangeTo = textColor(currentHighlighter);
        $('span.word.highlighted, span.whitespace.highlighted').css('color', colorToChangeTo)
      }
      if (request.msg == 'tab changed') {
        highlightedRgbVal = await getRBGValue();
        updateBG(highlightedRgbVal);
        currentHighlighter = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
        colorToChangeTo = textColor(currentHighlighter);
        $('span.word.highlighted, span.whitespace.highlighted').css('color', colorToChangeTo)
      }
    });

    //redefine variables when user scrolls
    $(document).scroll(function () {
      bottomOfScreen = $(window).scrollTop() + window.innerHeight;
      topOfScreen = $(window).scrollTop();
    });

    //wraps each word in a span tag and puts them in an array
    function wrapInSpans() {

      // skip over empty paragraphs
      if (checkedForEmptyParas == false) {
        //get all paragraphs
        allParas = $("p:visible").not("header p, footer p, div.dockcard_text p");
        for (var i = 0; i < allParas.length; i++) {
          // if length of para is not 0 (false) => add it to paras array
          if ($(allParas[i]).text().trim().length) {
            paras.push($(allParas[i]));
          }
        }
        checkedForEmptyParas = true;
      }

      //only split paragraph that haven't been split
      if (!$(paras[paraIndex]).hasClass("splitting")) {
        Splitting({ target: paras[paraIndex], by: "customPlugin" });
      }

      //puts all span elements of current paragraph into an array
      wordsInSpan = $(paras[paraIndex]).find("span.word, span.whitespace");

      //give all span elements in paragraph their original color
      for (var i = 0; i < wordsInSpan.length; i++) {
        if (resize == false) {
          $(wordsInSpan[i]).attr("originalColor", $(wordsInSpan[i]).css('color'));
        }
        // gives spaces a class of whitespace (needed for whitespace issue in splitting.js)
        if ($(wordsInSpan[i]).text() === ' ') {
          $(wordsInSpan[i]).attr("class", 'whitespace');
        }
      }
    }

    //creates two arrays: one is full of offsets from the top of element, second is offsets from the bottom of the element
    function getLineOffsets() {
      // clearing arrays 
      lineMedians = [];
      differences = [];
      lineOffsetsTop = [];
      lineOffsetsBottom = [];
      // loop thru all spans in para
      for (var i = 0; i < wordsInSpan.length; i++) {
        // gets the top and bottom offset of current word
        lineHeight = Math.round($(wordsInSpan[i]).outerHeight());
        currentWordTop = $(wordsInSpan[i]).offset().top;
        currentWordBottom = $(wordsInSpan[i]).offset().top + lineHeight;

        // gets top offset of previous word
        if (i > 0) {
          previousWordTop = $(wordsInSpan[i - 1]).offset().top;
        } else {
          previousWordTop = $(wordsInSpan[0]).offset().top;
        }

        // pushes the difference between the top of the current word and the top of the previous word
        // detects line breaks and other irregular characters (sub/superscripts)
        differences.push(
          Math.round(Math.abs(currentWordTop - previousWordTop))
        );

        // pushes the middle offset of the current word
        lineMedians.push(Math.round((currentWordBottom - currentWordTop) / 2));
      }

      // loops thru every middle offset
      for (var i = 0; i < lineMedians.length; i++) {
        lineHeight = $(wordsInSpan[i]).outerHeight();
        // add middle offset as an attribute to each word to be used in highlight() later on
        $(wordsInSpan[i]).attr(
          "middleOffset",
          $(wordsInSpan[i]).offset().top + lineMedians[i]
        );

        // if difference is greater than lineheight (that means its line break)
        if (i == 0 || differences[i] >= lineHeight) {
          // ignore whitespaces (workaround for splitting.js issue)
          if (!$(wordsInSpan[i]).hasClass("whitespace")) {
            // form arrays for the first word of every line
            // top offset of first word
            lineOffsetsTop.push($(wordsInSpan[i]).offset().top);
            // bottom offset of first word
            lineOffsetsBottom.push($(wordsInSpan[i]).offset().top + lineHeight);
          }
        }
      }

      // chronologically sorts arrays
      lineOffsetsTop.sort((a, b) => {
        return a - b;
      });
      lineOffsetsBottom.sort((a, b) => {
        return a - b;
      });
    }

    //keeps the highlighted line in the center block of the screen
    function keepLineInWindow() {
      line = $("span.word.highlighted");
      line[0].scrollIntoView({ block: "center" });
    }

    //highlights words that are inbetween lineOffsetsTop[i] and lineOffsetsBottom[i]
    function highlight() {
      // loop thru all spans in current paragraph
      for (var i = 0; i < wordsInSpan.length; i++) {
        // if the middle of current word is inbetween the top and bottom of the first word = > highlight
        // all words that make it through this statement are on the same line
        if (
          wordsInSpan[i].getAttribute("middleOffset") >=
          lineOffsetsTop[index] &&
          wordsInSpan[i].getAttribute("middleOffset") <=
          lineOffsetsBottom[index]
        ) {



          // add highlighter to word, and change the color of the word 
          $(wordsInSpan[i]).addClass("highlighted").css('color', colorToChangeTo);

          //if line is outside of view, scroll to it
          if ($(wordsInSpan[i]).offset().top + lineHeight > bottomOfScreen) {
            keepLineInWindow();
          } else if ($(wordsInSpan[i]).offset().top < topOfScreen) {
            keepLineInWindow();
          }
          //remove highlighter, and change color of text to it's original color if above statement isn't true
        } else {
          $(wordsInSpan[i]).removeClass("highlighted");
          $(wordsInSpan[i]).css('color', $(wordsInSpan[i]).attr('originalColor'));
        }
      }
      // move to next line if random whitespaces are being highlighted
      let line = $('span.word.highlighted, span.whitespace.highlighted')
      var lineData;
      // form a string of the current highlighted line
      $(line).each(function(i) {
        if (i == 0) {
          lineData = $(line[i]).attr('data-word');
        } else if (typeof $(line[i]).attr('data-word') === 'string') {
          lineData = lineData + $(line[i]).attr('data-word');
        } else if (typeof $(line[i]).attr('data-whitespace') === 'string') {
          lineData = lineData + $(line[i]).attr('data-whitespace');
        }
      })
      // if the string is empty after it is trimmed, move to next line and highlight again
      if($.trim(lineData) == '') {
        index++;
        highlight();
      }
    }

    //whole program in one function
    function setup() {
      wrapInSpans();
      getLineOffsets();
      highlight();
      resize = false;
    }

    //actually run the program
    setup();

    //see keyup handler
    function handleKeyPress(e) {
      // dont run in inputs or text areas
      if (!$(e.target).is("input, textarea")) {
        //up arrow OR w
        if (e.keyCode == 38 &&
          index > 0 ||
          e.keyCode == 87 &&
          index > 0
        ) {
          // move up a line
          index--;
          highlight();
          //down arrow OR s
        } else if (e.keyCode == 40 &&
          index < lineOffsetsTop.length - 1 ||
          e.keyCode == 83 &&
          index < lineOffsetsTop.length - 1
        ) {
          // move down a line
          index++;
          highlight();
          //down arrow (last line in paragraph but not the last paragraph on the page)
        } else if (
          e.keyCode == 40 &&
          index == lineOffsetsTop.length - 1 &&
          paraIndex < paras.length - 1 ||
          e.keyCode == 83 &&
          index == lineOffsetsTop.length - 1 &&
          paraIndex < paras.length - 1
        ) {
          // remove highlighter and restore text color
          currentLine = $(paras[paraIndex]).find("span.word.highlighted, span.whitespace.highlighted");
          for (var i = 0; i < currentLine.length; i++) {
            $(currentLine[i]).removeClass('highlighted').css('color', $(currentLine[i]).attr('originalColor'))
          }
          // move to next paragraph
          paraIndex++;
          // reset index
          index = 0;
          // run program for next paragraph
          setup();
          //up arrow OR w (first line of paragraph but not the first paragraph on the page)
        } else if (e.keyCode == 38 &&
          index == 0 && paraIndex > 0 ||
          e.keyCode == 87 &&
          index == 0 &&
          paraIndex > 0
        ) {
          // remove highlighter and restore text color
          currentLine = $(paras[paraIndex]).find("span.word.highlighted, span.whitespace.highlighted");
          for (var i = 0; i < currentLine.length; i++) {
            $(currentLine[i]).removeClass('highlighted').css('color', $(currentLine[i]).attr('originalColor'))
          }
          // move to previous paragraph
          paraIndex--;

          // wrapInSpans() isn't called because that function has previously ran on this paragraph
          // form wordsInSpan array
          wordsInSpan = $(paras[paraIndex]).find("span.word, span.whitespace");
          // get offsets for para
          getLineOffsets();
          // set the index to the last line of the para
          index = lineOffsetsTop.length - 1;
          // highlight
          highlight();
        }
      }
    }

    // run handelKeyPress when key is down (specifically arrow keys)
    $(document).keyup(handleKeyPress);

    //prevents arrow keys from scrolling up/down the page
    $(document).keydown(function (e) {
      // only prevent scrolling when the user isn't interacting with inputs or text areas
      if (!$(e.target).is("input, textarea")) {
        if (e.keyCode == 38 || e.keyCode == 40) {
          e.preventDefault();
        }
      }
    });

    // recalculates offests for paragraph because resizing the window changes the offsets of each word
    $(window).resize(function () {
      resize = true;
      setup();
    });

    // runProgram() has ran
    hasRan = true;
  }

  function resetProgram() {
    // remove highlighter and restore color of word
    currentLine = $(paras[paraIndex]).find("span.word.highlighted, span.whitespace.highlighted");
    for (var i = 0; i < currentLine.length; i++) {
      $(currentLine[i]).removeClass('highlighted').css('color', $(currentLine[i]).attr('originalColor'))
    }

    // remove all event listeners from the document object
    $(document).off();

    // clear every array
    paras = [];
    lineOffsetsTop = [];
    lineOffsetsBottom = [];
    lineMedians = [];
    differences = [];
    line = [];

    // runProgram hasn't ran (resetting the cycle)
    hasRan = false;
  }
};