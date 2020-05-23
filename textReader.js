//gets boolean value of switch from chrome storage
function getOnOffValue() {
  let value = new Promise((resolve) => {
    chrome.storage.sync.get("highlightedSwitch", function (result) {
      resolve(result.highlightedSwitch);
    });
  });
  return value;
}

function getRBGValue() {
  let value = new Promise((resolve) => {
    chrome.storage.sync.get("highlightedRgbVal", function (result) {
      resolve(result.highlightedRgbVal);
    });
  });
  return value;
}

function updateBG(valueToSet) {
  document.documentElement.style.setProperty("--background", valueToSet);
}

function textColor(bgColor) {
  var r = bgColor[0],
    g = bgColor[1],
    b = bgColor[2];
  var yiq = ((r * 0.299) + (g * 0.587) + (b * 0.114));
  return (yiq >= 135) ? 'black' : 'white';
}

//globals
var index = 0;
var paraIndex = 0;
var wordsInSpan = [];
var line = [];
var allParas;
var paras = [];
var bottomOfScreen = $(window).scrollTop() + window.innerHeight;
var topOfScreen = $(window).scrollTop();
var hasRan = false;
var checkedForEmptyParas = false;
var lineHeight;
var currentWord;
var previousWord;
var lineOffsetsTop = [];
var lineOffsetsBottom = [];
var differences = [];
var lineMedians = [];
var newWords = [];
var lines = [];
var onOffVal;
var highlightedRgbVal;
var currentWordTop;
var currentWordBottom;
var previousWordTop;
var colorToChangeTo;
var currentHighlighter
var originalTextColor;
var currentLine;

window.onload = async function () {

  //get current state of switch
  onOffVal = await getOnOffValue();
  // highlightedRgbVal = await getRBGValue();

  //logic to run program when switch is on/off/changed
  if (onOffVal) {
    runProgram();
    chrome.runtime.onMessage.addListener(async function (
      request,
      sender,
      sendResponse
    ) {
      if (request.msg == "changed to true") {
        runProgram();
      } else if (request.msg == "changed to false") {
        resetProgram();
      } else if (request.msg == "RBG changed") {
        onOffVal = await getOnOffValue();
        if (onOffVal) {
          highlightedRgbVal = await getRBGValue();
          updateBG(highlightedRgbVal);
        }
      }
    });
  } else {
    chrome.runtime.onMessage.addListener(async function (
      request,
      sender,
      sendResponse
    ) {
      if (request.msg == "changed to true") {
        runProgram();
      } else if (request.msg == "changed to false") {
        resetProgram();
      } else if (request.msg == "RBG changed") {
        onOffVal = await getOnOffValue();
        if (onOffVal) {
          highlightedRgbVal = await getRBGValue();
          updateBG(highlightedRgbVal);
        }
      }
    });
  }

  //listens for tab change, then runs the program based on state of switch
  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if (request.msg == "tab changed") {
      onOffVal = await getOnOffValue();
      highlightedRgbVal = await getRBGValue();
      updateBG(highlightedRgbVal);
      currentHighlighter = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
      colorToChangeTo = textColor(currentHighlighter);
      if (onOffVal) {
        if (hasRan == false) {
          runProgram();
        }
      } else {
        resetProgram();
      }
    }
  });

  async function runProgram() {


    checkedForEmptyParas = false;
    highlightedRgbVal = await getRBGValue();
    updateBG(highlightedRgbVal);
    currentHighlighter = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
    colorToChangeTo = textColor(currentHighlighter);

    chrome.runtime.onMessage.addListener(async function (
      request,
      sender,
      sendResponse
    ) {
      if (request.msg == "RBG changed") {
        highlightedRgbVal = await getRBGValue();
        currentHighlighter = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
        colorToChangeTo = textColor(currentHighlighter);
        highlight();
      }
    });

    //redefines these variables when the user scrolls
    $(document).scroll(function () {
      bottomOfScreen = $(window).scrollTop() + window.innerHeight;
      topOfScreen = $(window).scrollTop();
    });

    //wraps each word in a span tag and puts them in an array
    function wrapInSpans() {
      //get all paragraphs
      allParas = $("p:visible").not("header p, footer p, div.dockcard_text p");

      //if any of the paras have no text in them, dont add to paras array
      if (checkedForEmptyParas == false) {
        for (var i = 0; i < allParas.length; i++) {
          if ($(allParas[i]).text().trim().length) {
            paras.push($(allParas[i]));
            checkedForEmptyParas = true;
          }
        }
      }

      //only split paragraph that haven't been split
      if (!$(paras[paraIndex]).hasClass("splitting")) {
        Splitting({ target: paras[paraIndex], by: "customPlugin"});
      }
      //puts all span elements into an array
      wordsInSpan = $(paras[paraIndex]).find("span.word, span.whitespace").not("span.word.highlighted, span.whitespace.highlighted");
      //give all span elements in paragraph their original color
      for (var i = 0; i < wordsInSpan.length; i++) {
        $(wordsInSpan[i]).attr("originalColor", $(wordsInSpan[i]).css('color'));
        if ($(wordsInSpan[i]).text() === ' ') {
          $(wordsInSpan[i]).attr("class", 'whitespace');
        }
      }
    }

    //creates two arrays: one is full of offsets from the top of element, second is offsets from the bottom of the element
    function getLineOffsets() {
      lineMedians = [];
      differences = [];
      lineOffsetsTop = [];
      lineOffsetsBottom = [];
      for (var i = 0; i < wordsInSpan.length; i++) {
        //gets previous and current word offsets
        lineHeight = Math.round($(wordsInSpan[i]).outerHeight());
        currentWordTop = $(wordsInSpan[i]).offset().top;
        currentWordBottom = $(wordsInSpan[i]).offset().top + lineHeight;
        if (i > 0) {
          previousWordTop = $(wordsInSpan[i - 1]).offset().top;
        } else {
          previousWord = $(wordsInSpan[0]).offset;
          previousWordTop = $(wordsInSpan[0]).offset().top;
        }
        //pushes the difference between the last word, and the current one (can detect line breaks/special characters like sub/superscripts)
        differences.push(
          Math.round(Math.abs(currentWordTop - previousWordTop))
        );

        lineMedians.push(Math.round((currentWordBottom - currentWordTop) / 2));
      }

      for (var i = 0; i < lineMedians.length; i++) {
        lineHeight = $(wordsInSpan[i]).outerHeight();
        $(wordsInSpan[i]).attr(
          "middleOffset",
          $(wordsInSpan[i]).offset().top + lineMedians[i]
        );

        if (i == 0 || differences[i] >= lineHeight) {
          if (!$(wordsInSpan[i]).hasClass("whitespace")) {
            lineOffsetsTop.push($(wordsInSpan[i]).offset().top);
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

    //keep the highlighted line in the center block of the screen
    function keepLineInWindow() {
      line = $("span.word.highlighted");
      line[0].scrollIntoView({ block: "center" });
    }

    //highlights words that are inbetween inbetweenOffsets[i] and lineOffsetsBottom[i]
    function highlight() {
      for (var i = 0; i < wordsInSpan.length; i++) {
        if (
          wordsInSpan[i].getAttribute("middleOffset") >=
          lineOffsetsTop[index] &&
          wordsInSpan[i].getAttribute("middleOffset") <=
          lineOffsetsBottom[index]
        ) {
          $(wordsInSpan[i]).addClass("highlighted").css('color', colorToChangeTo);
          updateBG(highlightedRgbVal);

          //if line is outside of view, scroll to it
          if ($(wordsInSpan[i]).offset().top + lineHeight > bottomOfScreen) {
            keepLineInWindow();
          } else if ($(wordsInSpan[i]).offset().top < topOfScreen) {
            keepLineInWindow();
          }
          //remove highlight if above statement isn't true
        } else {
          $(wordsInSpan[i]).removeClass("highlighted");
          $(wordsInSpan[i]).css('color', $(wordsInSpan[i]).attr('originalColor'));
        }
      }
    }

    //whole program in one function
    function setup() {
      // $("p span.word.highlighted, p span.whitespace.highlighted").removeClass(
      //   "highlighted"
      // ).css('color', $(this).attr('originalColor'));
      currentLine = $(paras[paraIndex]).find("span.word.highlighted, span.whitespace.highlighted");
      for (var i = 0; i < currentLine.length; i++) {
        $(currentLine[i]).removeClass('highlighted').css('color', $(currentLine[i]).attr('originalColor'))
      }
      wrapInSpans();
      getLineOffsets();
      highlight();
    }

    //actually run the program
    setup();

    //see keyup handler
    function handleKeyPress(e) {
      if (!$(e.target).is("input, textarea")) {
          //up arrow
        if (e.keyCode == 38 && index > 0) {
          index--;
          highlight();
          //down arrow
        } else if (e.keyCode == 40 && index < lineOffsetsTop.length - 1) {
          index++;
          highlight();
          //down arrow
        } else if (
          e.keyCode == 40 &&
          index == lineOffsetsTop.length - 1 &&
          paraIndex < paras.length - 1
        ) {
          //give current line their colors back!
          currentLine = $(paras[paraIndex]).find("span.word.highlighted, span.whitespace.highlighted");
          for (var i = 0; i < currentLine.length; i++) {
            $(currentLine[i]).removeClass('highlighted').css('color', $(currentLine[i]).attr('originalColor'))
          }
          paraIndex++;
          index++;
          index = 0;
          setup();
          //up arrow
        } else if (e.keyCode == 38 && index == 0 && paraIndex > 0) {
          //give current line their colors back!
          currentLine = $(paras[paraIndex]).find("span.word.highlighted, span.whitespace.highlighted");
          for (var i = 0; i < currentLine.length; i++) {
            $(currentLine[i]).removeClass('highlighted').css('color', $(currentLine[i]).attr('originalColor'))
          }
          paraIndex--;
          wordsInSpan = $(paras[paraIndex]).find("span.word, span.whitespace");
          getLineOffsets();
          index = lineOffsetsTop.length - 1;
          highlight();
        }
      }
    }

    //changes line selected with arrow keys
    $(document).keyup(handleKeyPress);

    //prevents arrowkeys from scrolling
    $(document).keydown(function (e) {
      if (!$(e.target).is("input, textarea")) {
        if (e.keyCode == 38 || e.keyCode == 40) {
          e.preventDefault();
        }
      }
    });

    //gets new offset to calculate line on window resize
    $(window).resize(setup);

    hasRan = true;
  }

  //what do I put in here to stop the program from running??
  function resetProgram() {
    //give current line their colors back!
    currentLine = $(paras[paraIndex]).find("span.word.highlighted, span.whitespace.highlighted");
    for (var i = 0; i < currentLine.length; i++) {
      $(currentLine[i]).removeClass('highlighted').css('color', $(currentLine[i]).attr('originalColor'))
    }
    paras = [];
    $(document).off();
    lineOffsetsTop = [];
    lineOffsetsBottom = [];
    lineMedians = [];
    differences = [];
    line = [];
    hasRan = false;
  }
};