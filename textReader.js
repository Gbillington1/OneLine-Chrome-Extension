//gets boolean value of switch from chrome storage
function getOnOffValue() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("highlightedSwitch", function(result) {
      resolve(result.highlightedSwitch);
    });
  });
  return value;
}

function getRBGValue() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("highlightedRgbVal", function(result) {
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
var filteredOffsets = [];
var offsetHeights = [];
var line = [];
var paras;
var bottomOfScreen = $(window).scrollTop() + window.innerHeight;
var topOfScreen = $(window).scrollTop();
var hasRan = false;
var lineHeight;
var currentWordOffset;
var previousWordOffset;
var differences = [];
var lineOffsetsTop = [];
var lineOffsetsBottom = [];
var inbetweenOffsets = [];
var onOffVal;
var highlightedRgbVal;

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  if (request.msg == "Extension installed") {
    onOffVal = await getOnOffValue();
    highlightedRgbVal = await getRBGValue();
    updateBG(highlightedRgbVal);
  }
});

window.onload = async function() {
  //get current state of switch
  onOffVal = await getOnOffValue();
  // highlightedRgbVal = await getRBGValue();

  //logic to run program when switch is on/off/changed
  if (onOffVal) {
    runProgram();
    chrome.runtime.onMessage.addListener(async function(
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
    chrome.runtime.onMessage.addListener(function(
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
  chrome.runtime.onMessage.addListener(async function(
    request,
    sender,
    sendResponse
  ) {
    if (request.msg == "tab changed") {
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
    $(document).scroll(function() {
      bottomOfScreen = $(window).scrollTop() + window.innerHeight;
      topOfScreen = $(window).scrollTop();
    });

    //wraps each word in a span tag and puts them in an array
    function wrapInSpans() {
      paras = $("p:visible").not("header p, footer p, svg p, p:hidden, div.dockcard_text p");
      for (var i = 0; i < paras.length; i++) {
        Splitting({ target: paras[i], by: "words" });
      }
      //puts all span elements into an array
      wordsInSpan = $("p span.word, p span.whitespace");
    }

    //creates two arrays: one is full of offsets from the top of element, second is offsets from the bottom of the element
    function getLineOffsets() {
      for (var i = 0; i < wordsInSpan.length; i++) {
        //gets previous and current word offsets
        if (i > 0) {
          currentWordOffset = $(wordsInSpan[i]).offset().top;
          previousWordOffset = $(wordsInSpan[i - 1]).offset().top;
        } else {
          currentWordOffset = $(wordsInSpan[i]).offset().top;
          previousWordOffset = $(wordsInSpan[0]).offset().top;
        }
        //pushes the difference between the last word, and the current one (can detect line breaks/special characters like sub/superscripts)
        differences.push(Math.abs(currentWordOffset - previousWordOffset));
      }
      //wordsInSpan array and differences array are the same length ALWAYS
      for (var i = 0; i < differences.length; i++) {
        //get the line height of each word
        lineHeight = $(wordsInSpan[i]).outerHeight();
        // console.log(lineHeight)
        //checks to see if there is a new line (if difference is > lineHeight, there is a new line)
        if (i == 0 || differences[i] >= lineHeight) {
          //workaround for weird space issue
          if (!$(wordsInSpan[i]).hasClass("whitespace")) {
            //gets the offset from the TOP of the first word in the line
            lineOffsetsTop.push($(wordsInSpan[i]).offset().top);
            //gets the offset from the BOTTOM of the first word in the line
            lineOffsetsBottom.push($(wordsInSpan[i]).offset().top + lineHeight);
          }
        }
      }
      //chronologically sorts arrays
      lineOffsetsTop.sort((a, b) => {
        return a - b;
      });
      lineOffsetsBottom.sort((a, b) => {
        return a - b;
      });
    }

    //finds the number (in px) that is directly inbetween the bottom of each line, and the top of the next line
    function getInbetweenOffsets() {
      for (var i = 0; i < lineOffsetsTop.length; i++) {
        //setting 1st offset to top of word - 10px => only because this algorithm will never find an offset for the first line
        if (i == 0) {
          //is this acceptable?
          inbetweenOffsets.push(lineOffsetsTop[i] - 10);
        } else {
          //finds the distance
          let distanceBetweenEls;
          distanceBetweenEls = lineOffsetsTop[i] - lineOffsetsBottom[i - 1];
          //pushes half of distance into array (aka inbetween each line)
          inbetweenOffsets.push(lineOffsetsBottom[i - 1] + distanceBetweenEls / 2);
        }
      }
    }

    //gets all of the necessary offset arrays
    function getOffsets() {
      getLineOffsets();
      getInbetweenOffsets();
      //pushing offsetTop of each span.word into an array of offsetHeights
      // for (var i = 0; i < wordsInSpan.length; i++) {
      //     if (!$(wordsInSpan[i]).hasClass("whitespace") &&
      //         (i == 0 ||
      //             $(wordsInSpan[i]).offset().top - $(wordsInSpan[i - 1]).offset().top >= 5 ||
      //             $(wordsInSpan[i]).offset().top - $(wordsInSpan[i - 1]).offset().top <= -5)) {
      //         offsetHeights.push($(wordsInSpan[i]).offset().top);
      //     }
      // }
      // //round offsets
      // for (var i = 0; i < offsetHeights.length; i++) {
      //     offsetHeights[i] = Math.round(offsetHeights[i]);
      // }

      // //removes duplicates offsets from offsetHeights and makes a filtered array(filteredOffsets)
      // filteredOffsets = offsetHeights.filter(function (elem, index, self) {
      //     return index === self.indexOf(elem);
      // });
      // filteredOffsets.sort((a, b) => { return a - b });
    }

    //keep the highlighted line in the center block of the screen
    function keepLineInWindow() {
      line = $("span.word.highlighted");
      line[0].scrollIntoView({ block: "center" });
    }

    //highlights words that are inbetween inbetweenOffsets[i] and lineOffsetsBottom[i]
    function highlight() {
      for (var i = 0; i < wordsInSpan.length; i++) {
        lineHeight = $(wordsInSpan[i]).outerHeight();
        if (
          $(wordsInSpan[i]).offset().top >= inbetweenOffsets[index] &&
          $(wordsInSpan[i]).offset().top <= lineOffsetsBottom[index]
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
        getOffsets();
      }
    }

    //whole program in one function
    function setup() {
      wrapInSpans();
      getOffsets();
      highlight();
    }

    //actually run the program
    setup();

    //see below
    function handleKeyPress(e) {
      if (e.keyCode == 38 && index > 0) {
        index--;
        highlight();
      } else if (e.keyCode == 40 && index <= lineOffsetsTop.length) {
        index++;
        highlight();
      }
    }

    //changes line selected with arrow keys
    $(document).keyup(handleKeyPress);

    //prevents arrowkeys from scrolling
    $(document).keydown(function(e) {
      if (e.keyCode == 38 || e.keyCode == 40) {
        e.preventDefault();
      }
    });

    //gets new offset to calculate line on window resize
    $(window).resize(function() {
      // offsetHeights = [];
      // filteredOffsets = [];
      lineOffsetsTop = [];
      lineOffsetsBottom = [];
      inbetweenOffsets = [];
      differences = [];
      getOffsets();
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
    inbetweenOffsets = [];
    differences = [];
    // offsetHeights = [];
    line = [];
    hasRan = false;
  }
};
