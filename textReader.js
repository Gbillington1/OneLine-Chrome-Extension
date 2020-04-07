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

//globals
var index = 0;
var paraIndex = 0;
var wordsInSpan;
var line = [];
var paras;
var bottomOfScreen = $(window).scrollTop() + window.innerHeight;
var topOfScreen = $(window).scrollTop();
var hasRan = false;
var lineHeight;
var currentWord;
var previousWord;
var middleOfWordOffsets = [];
var lineOffsetsTop = [];
var lineOffsetsBottom = [];
var differences = [];
var lineMedians = [];
var onOffVal;
var highlightedRgbVal;
var inputs;
var totalLengthOfInputs = 0;

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.msg == "Extension installed") {
    onOffVal = await getOnOffValue();
    highlightedRgbVal = await getRBGValue();
    updateBG(highlightedRgbVal);
  }
});

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
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request.msg == "changed to true") {
        runProgram();
        // updateBG(highlightedRgbVal);
      } else if (request.msg == "changed to false") {
        resetProgram();
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
      inputs = [];
      totalLengthOfInputs = 0;
      onOffVal = await getOnOffValue();
      highlightedRgbVal = await getRBGValue();
      updateBG(highlightedRgbVal);
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
    highlightedRgbVal = await getRBGValue();
    updateBG(highlightedRgbVal);
    //redefines these variables when the user scrolls
    $(document).scroll(function () {
      bottomOfScreen = $(window).scrollTop() + window.innerHeight;
      topOfScreen = $(window).scrollTop();
    });

    //wraps each word in a span tag and puts them in an array
    function wrapInSpans() {
      paras = $("p:visible").not("header p, footer p, div.dockcard_text p");
      for (var i = 0; i < paras.length; i++) {
        Splitting({ target: paras[i], by: "words" });
      }
      //puts all span elements into an array
      wordsInSpan = $("p span.word, p span.whitespace");
    }

    //creates two arrays: one is full of offsets from the top of element, second is offsets from the bottom of the element
    function getLineOffsets() {
      for (var i = 0; i < wordsInSpan.length; i++) {
        var currentWordTop;
        var currentWordBottom;
        var previousWordTop;
        //gets previous and current word offsets
        lineHeight = Math.round($(wordsInSpan[i]).outerHeight());
        currentWordTop = $(wordsInSpan[i]).offset().top;
        currentWordBottom = $(wordsInSpan[i]).offset().top + lineHeight;
        if (i > 0) {
          previousWordTop = $(wordsInSpan[i - 1]).offset().top;
        } else {
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

        middleOfWordOffsets.push(
          Math.round($(wordsInSpan[i]).offset().top) + lineMedians[i]
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
          middleOfWordOffsets[i] >= lineOffsetsTop[index] &&
          middleOfWordOffsets[i] <= lineOffsetsBottom[index]
        ) {
          $(wordsInSpan[i]).addClass("highlighted");
          updateBG(highlightedRgbVal);
          // $(".highlighted").css("background-color", highlightedRgbVal);

          //if line is outside of view, scroll to it
          if ($(wordsInSpan[i]).offset().top + lineHeight > bottomOfScreen) {
            keepLineInWindow();
          } else if ($(wordsInSpan[i]).offset().top < topOfScreen) {
            keepLineInWindow();
          }
          //remove highlight if above statement isn't true
        } else {
          $(wordsInSpan[i]).removeClass("highlighted");
        }
      }
      // splitNextPara();
    }

    //Optimization
    //When user gets to last word in current paragraph => increase paraIndex by 1 => split by paras[paraIndex]the end of the wordsInSpan array
    function splitNextPara() {
      var spanIndex = wordsInSpan.length - 1;
      line = $(".highlighted");
      //need to figure out a way to decrease the paraIndex when line moves into previous paragraph - do I need to do this?
      if ($(line[0]).offset().top == $(wordsInSpan[spanIndex]).offset().top) {
        paraIndex++;
        Splitting({ target: paras[paraIndex], by: "words" });
        wordsInSpan = $("p span.word, p span.whitespace");
        getLineOffsets();
      }
    }

    //whole program in one function
    function setup() {
      wrapInSpans();
      getLineOffsets();
      highlight();
    }

    //actually run the program
    setup();

    //see below
    function handleKeyPress(e) {
      if (!$(e.target).is("input, textarea")) {
        if (e.keyCode == 38 && index > 0) {
          index--;
          highlight();
        } else if (
          e.keyCode == 40 &&
          index <= lineOffsetsTop.length
        ) {
          index++;
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
      //trigger on f9
      // if (e.keyCode == 120) {
      //   setup();
      // }
    });

    //gets new offset to calculate line on window resize
    $(window).resize(function () {
      lineOffsetsTop = [];
      lineOffsetsBottom = [];
      middleOfWordOffsets = [];
      lineMedians = [];
      differences = [];
      getLineOffsets();
      highlight();
    });

    hasRan = true;
  }

  //what do I put in here to stop the program from running??
  function resetProgram() {
    if (hasRan) {
      for (var i = 0; i < wordsInSpan.length; i++) {
        $(wordsInSpan[i]).removeClass("highlighted");
      }
    }
    $(document).off();
    lineOffsetsTop = [];
    lineOffsetsBottom = [];
    middleOfWordOffsets = [];
    lineMedians = [];
    differences = [];
    line = [];
    hasRan = false;
  }
};
