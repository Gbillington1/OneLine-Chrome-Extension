// universal function to return values from chrome storage
function getVal(value) {
  return new Promise(resolve => {
    chrome.storage.sync.get([value], result => {
      resolve(result[value]);
    })
  })
}

// updates the color of the line
function updateBG(valueToSet) {
  document.documentElement.style.setProperty("--background", valueToSet);
}

// determines text color based on the color of the line (takes an array)
function textColor(bgColor) {
  let r = bgColor[0],
    g = bgColor[1],
    b = bgColor[2];
  let yiq = ((r * 0.299) + (g * 0.587) + (b * 0.114));
  return (yiq >= 135) ? 'black' : 'white';
}

// Get the word of a string given the string and index - unused? 
// function getWordAt(str, pos) {
//   // Perform type conversions.
//   str = String(str);
//   pos = Number(pos) >>> 0;

//   // Search for the word's beginning and end.
//   let left = str.slice(0, pos + 1).search(/\S+$/),
//     right = str.slice(pos).search(/\s/);

//   // The last word in the string is a special case.
//   if (right < 0) {
//     return str.slice(left);
//   }

//   // Return the word, using the located bounds to extract it from the string.
//   return str.slice(left, right + pos);
// }

// indecies 
let index = 0;
let paraIndex = 0;
let lastWordIndex = 0;

// arrays 
let wordsInSpan = [];
let line = [];
let paras = [];
let lineOffsetsTop = [];
let lineOffsetsBottom = [];
let differences = [];
let lineMedians = [];
let lastWordInLine = [];
let allParas;
let currentHighlighter // color of line (split up)

// booleans
let hasRan = false;
let checkedForEmptyParas = false;
let onOffVal;
let resize = false;
let ttsIsOn = false;
let isPaused = false;
let charIndexZero = true;

// lets for scrolling
let bottomOfScreen;
let topOfScreen;

// redifines vars when scroll
$(document).scroll(function () {
  bottomOfScreen = $(window).scrollTop() + window.innerHeight;
  topOfScreen = $(window).scrollTop();
});

// offsets - # of pixels above and below 
let  currentWordTop;
let  currentWordBottom;

// is this the middle (px val) of the word? 
let  previousWordTop;

// other vars
var lineHeight;
// color of the line
let highlightedRgbVal;
// holder variable?  
let colorToChangeTo;
let currentLine;

// for text to speech
let synth = window.speechSynthesis;
let voices = [];
let voiceIndex;
let rate;
let pitch = 1;
let currentParaText;
let myTimeout;

window.onload = async function () {
  // This stops the Speech Synthesis API (text to speech) when the page reloads
  synth.cancel();

  // This gets the boolean value of the on/off switch form Chrome storage
  onOffVal = await getVal("highlightedSwitch");

  //logic to run program when switch is on/off/changed

  // if switch is on, run program and listen for changes on the switch
  if (onOffVal) {
    runProgram();
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      switch (request.msg) {
        case "highlighter changed to true":
          runProgram();
          break;

        case "highlighter changed to false":
          resetProgram();
          break;

        default:
          break;
      }
    });
    // if switch is off, listen for changes on the switch
  } else {
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      switch (request.msg) {
        case "highlighter changed to true":
          runProgram();
          break;

        case "highlighter changed to false":
          resetProgram();
          break;

        default:
          break;
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
      onOffVal = await getVal("highlightedSwitch");
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

  // pause and resume speaking, sets a timer for 10 seconds (why does it do setTimeout twice? see tts function)
  function myTimer() {
    synth.pause();
    synth.resume();
    myTimeout = setTimeout(myTimer, 10000);
  }

  // runs the program
  async function runProgram() {

    // program hasn't checkef for empty paras
    checkedForEmptyParas = false;

    // update color of line and text
    highlightedRgbVal = await getVal("highlightedRgbVal");
    // if rgb val hasn't been set => set it 
    if (highlightedRgbVal === undefined) {
      highlightedRgbVal = 'rgb(248, 253, 137)';
    }
    updateBG(highlightedRgbVal);

    currentHighlighter = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
    colorToChangeTo = textColor(currentHighlighter);

    // text to speech 
    async function textToSpeech() {

      currentParaText = $(paras[paraIndex]).text()

      // set a timer to pause and resume every 10 seconds (prevents random stopping in the paragraph)
      myTimeout = setTimeout(myTimer, 10000);

      // get rate and voice index from storage
      rate = await getVal("rate");
      voiceIndex = await getVal("currentVoice");
      voices = synth.getVoices();

      // create speech instance with highlighted line as the text input
      let utterThis = new SpeechSynthesisUtterance(currentParaText);

      // form the utterThis obj 
      utterThis.voice = voices[voiceIndex];

      utterThis.pitch = pitch;

      utterThis.rate = rate;

      console.log(utterThis);

      // clear timeout on end
      utterThis.onend = function () {
        clearTimeout(myTimeout);
      }

      // speak
      synth.speak(utterThis);

    }

    // listen for changed in RGB and tab changes => update color of line and text
    chrome.runtime.onMessage.addListener(async function (
      request,
      sender,
      sendResponse
    ) {
      switch (request.msg) {
        case "RGB changed":
          highlightedRgbVal = await getVal("highlightedRgbVal");
          updateBG(highlightedRgbVal);
          currentHighlighter = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
          colorToChangeTo = textColor(currentHighlighter);
          $('span.word.highlighted, span.whitespace.highlighted').css('color', colorToChangeTo)
          break;

        case "tab changed":
          highlightedRgbVal = await getVal("highlightedRgbVal");
          updateBG(highlightedRgbVal);
          currentHighlighter = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
          colorToChangeTo = textColor(currentHighlighter);
          $('span.word.highlighted, span.whitespace.highlighted').css('color', colorToChangeTo);
          clearTimeout(myTimeout);
          synth.cancel();
          ttsIsOn = false;
          isPaused = false;
          break;

        case "tts started":
          if (ttsIsOn == false) {
            ttsIsOn = true;
            textToSpeech();
          } else if (isPaused) {
            myTimeout = setTimeout(myTimer, 10000);
            isPaused = false;
            synth.resume();
          }
          break;

        case "play/pause":
          if (ttsIsOn && isPaused == false) {
            clearTimeout(myTimeout);
            isPaused = true;
            synth.pause();
          } else if (isPaused) {
            isPaused = false;
            synth.resume();
            myTimeout = setTimeout(myTimer, 10000);
          }
          break;

        case "stopped":
          ttsIsOn = false;
          clearTimeout(myTimeout);
          synth.cancel();
          break;

        default:
          break;
      }
    });

    //wraps each word in a span tag and puts them in an array
    function wrapInSpans() {

      // skip over empty paragraphs
      if (checkedForEmptyParas == false) {
        //get all paragraphs
        allParas = $("p:visible").not("header p, footer p, div.dockcard_text p, p[width^='0']");
        for (let i = 0; i < allParas.length; i++) {
          // if length of para is not 0 (false) => add it to paras array
          if ($(allParas[i]).text().trim().length) {
            paras.push($(allParas[i]));
          }
        }

        // possible replacement for the above code - not sure if it has that much of an advantage though
        // paras = allParas.map((para) => {
        //   // if length of para is not 0 (false) => add it to paras array
        //   if ($(para).text().trim().length) {
        //     paras.push($(para));
        //   }
        // })

        checkedForEmptyParas = true;
      }

      //only split paragraph that haven't been split
      if (!$(paras[paraIndex]).hasClass("splitting")) {
        Splitting({ target: paras[paraIndex], by: "customPlugin" });
      }

      //puts all span elements of current paragraph into an array
      wordsInSpan = $(paras[paraIndex]).find("span.word, span.whitespace");

      //give all span elements in paragraph their original color
      let wordIndex = 0;
      for (let i = 0; i < wordsInSpan.length; i++) {

        // gives spaces a class of whitespace (needed for whitespace issue in splitting.js)
        if ($.trim($(wordsInSpan[i]).text()) == '') {
          $(wordsInSpan[i]).attr("class", 'whitespace');
        }

        if (resize == false) {
          $(wordsInSpan[i]).attr("originalColor", $(wordsInSpan[i]).css('color'));
        }

        // index all words (increments by 1) because splitting.js --word-index is broken
        if ($(wordsInSpan[i]).hasClass('word')) {
          $(wordsInSpan[i]).attr('index', wordIndex)
          wordIndex++;
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
      lastWordInLine = [];
      // loop thru all spans in para
      for (let i = 0; i < wordsInSpan.length; i++) {
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
      for (let i = 0; i < lineMedians.length; i++) {
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

            // add the last word in the line to an array (i - 2 because there is a trailing whitespace at the end of the line)
            if (!Object.keys($(wordsInSpan[i - 2])).length == 0 && $(wordsInSpan[i - 1]).text() != '-') {
              lastWordInLine.push($(wordsInSpan[i - 2]).text());
              // $(wordsInSpan[i - 2]).attr('isLastWord', true);
            } else if (!Object.keys($(wordsInSpan[i - 2])).length == 0 && $(wordsInSpan[i - 1]).text() == '-') {
              lastWordInLine.push($(wordsInSpan[i - 2]).text() + $(wordsInSpan[i - 1]).text() + $(wordsInSpan[i]).text())
            }

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
      for (let i = 0; i < wordsInSpan.length; i++) {
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
    }

    //whole program in one function
    function setup() {
      if (ttsIsOn) {
        wordIndex = 0;
        textToSpeech();
      }
      wrapInSpans();
      getLineOffsets();
      // add the last word in paragraph to last word array
      // the last word doesn't get added because there isn't another line for it to be referenced off of
      lastWordInLine.push($(wordsInSpan[wordsInSpan.length - 1]).text());
      // $(wordsInSpan[wordsInSpan.length - 1]).attr('isLastWord', true);
      highlight();
      resize = false;
      lastWordIndex = 0;
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
          for (let i = 0; i < currentLine.length; i++) {
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
          for (let i = 0; i < currentLine.length; i++) {
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
    for (let i = 0; i < currentLine.length; i++) {
      $(currentLine[i]).removeClass('highlighted').css('color', $(currentLine[i]).attr('originalColor'))
    }

    // remove all event listeners from the document object
    $(document).off();

    // clear every array
    paras = [];
    lineOffsetsTop = [];
    lineOffsetsBottom = [];
    lastWordInLine = [];
    lineMedians = [];
    differences = [];
    line = [];

    // runProgram hasn't ran (resetting the cycle)
    hasRan = false;
  }
};