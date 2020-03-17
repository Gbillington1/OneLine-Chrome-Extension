//gets boolean value of switch from chrome storage
function getOnOffValue() {
    let value = new Promise((resolve) => {
        chrome.storage.sync.get('highlightedSwitch', function (result) {
            resolve(result.highlightedSwitch);
        })
    })
    return value;
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

window.onload = async function () {
    //get current state of switch
    var onOffVal = await getOnOffValue();

    //logic to run program when switch is on/off/changed
    if (onOffVal) {
        runProgram();
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.msg == "changed to true") {
                runProgram();
            } else if (request.msg == "changed to false") {
                resetProgram();
            }
        })
    } else {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.msg == "changed to true") {
                runProgram();
            } else if (request.msg == "changed to false") {
                resetProgram();
            }
        })
    }

    //listens for tab change, then runs the program based on state of switch
    chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
        if (request.msg == "tab changed") {
            onOffVal = await getOnOffValue();
            if (onOffVal) {
                runProgram();
            } else {
                resetProgram();
            }
        }
    })

    function runProgram() {
        // var whitespaces;
        // var p;
        hasRan = true;
        //redefines these variables when the user scrolls
        $(document).scroll(function () {
            bottomOfScreen = $(window).scrollTop() + window.innerHeight;
            topOfScreen = $(window).scrollTop();
        });

        //wraps each word in a span tag and puts them in an array
        function wrapInSpans() {
            paras = $('p:visible').not("header p, footer p");
            for (var i = 0; i < paras.length; i++) {
                Splitting({ target: paras[i], by: "words" });
                // p = $(paras[i]).text();
                // whitespaces = p.split(/\b\w/);
                // for (var i = 0; i < whitespaces.length; i++) {
                //     $(whitespaces[i]).wrap("<span class='ws'></span>");
                // } console.log(whitespaces)
            }
            //puts all span elements into an array
            wordsInSpan = $("p span.word, p span.whitespace");
        };

        //get the offsetTops of each span tag and filters them into an array
        function getOffsets() {
            //pushing offsetTop of each span.word into an array of offsetHeights
            for (var i = 0; i < wordsInSpan.length; i++) {
                //workaround for wacky space issue
           
                if (!$(wordsInSpan[i]).hasClass("whitespace") && 
                        (i == 0 || 
                         $(wordsInSpan[i]).offset().top - $(wordsInSpan[i - 1]).offset().top >= 5 ||
                         $(wordsInSpan[i]).offset().top - $(wordsInSpan[i - 1]).offset().top <= -5))
                {
                    offsetHeights.push($(wordsInSpan[i]).offset().top);
                }
            }
            //round offsets
            for (var i = 0; i < offsetHeights.length; i++) {
                offsetHeights[i] = Math.round(offsetHeights[i]);
            }
            
            //removes duplicates offsets from offsetHeights and makes a filtered array(filteredOffsets)
            filteredOffsets = offsetHeights.filter(function (elem, index, self) {
                return index === self.indexOf(elem);
            });
            filteredOffsets.sort((a, b) => { return a - b });
            console.log(filteredOffsets)
        }

        //keep the highlighted line in the center block of the screen
        function keepLineInWindow() {
            line = $("span.word.highlighted");
            line[0].scrollIntoView({ block: "center" });
        };

        //attempting to select offsets that have the same offset (if that makes sense)
        function highlight() {
            var previousLine;
            if (index > 0) {
                previousLine = index - 1;
            } else {
                previousLine = 0;
            }
            var lineHeight = filteredOffsets[index] - filteredOffsets[previousLine];
            for (var i = 0; i < wordsInSpan.length; i++) {
                //selects anything (superscripts, subscripts, blockquotes) that are within a 5 pixle range of the selected line
                if (filteredOffsets[index] <= (Math.round($(wordsInSpan[i]).offset().top)) + 5 && filteredOffsets[index] >= (Math.round($(wordsInSpan[i]).offset().top)) - 5) {
                    $(wordsInSpan[i]).addClass("highlighted");
                    if ($(wordsInSpan[i]).offset().top + lineHeight > bottomOfScreen) {
                        keepLineInWindow();
                    } else if ($(wordsInSpan[i]).offset().top < topOfScreen) {
                        keepLineInWindow();
                    }
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
            } else if (e.keyCode == 40 && index <= filteredOffsets.length) {
                index++;
                highlight();
            }
        }

        //changes line selected with arrow keys
        $(document).keyup(handleKeyPress);

        //prevents arrowkeys from scrolling
        $(document).keydown(function (e) {
            if (e.keyCode == 38 || e.keyCode == 40) {
                e.preventDefault();
            }
        });

        //gets new offset to calculate line on window resize
        $(window).resize(function () {
            offsetHeights = [];
            filteredOffsets = [];
            getOffsets();
            highlight();
        });
    }

    //what do I put in here to stop the program from running??
    function resetProgram() {
        if (hasRan) {
            for (var i = 0; i < wordsInSpan.length; i++) {
                $(wordsInSpan[i]).removeClass("highlighted");
            }
        }
        $(document).off();
        filteredOffsets = [];
        offsetHeights = [];
        line = [];
    }
};
