window.onload = function () {
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

    //redefines these variables when the user scrolls
    $(document).scroll(function () {
        console.log("scrolled");
        bottomOfScreen = $(window).scrollTop() + window.innerHeight;
        topOfScreen = $(window).scrollTop();
    });

    //wraps each word in a span tag and puts them in an array
    function wrapInSpans() {
        paras = $('p:visible').not("header p, footer p");
        for (var i = 0; i < paras.length; i++) {
            Splitting({ target: paras[i], by: "words" });
        }
        //puts all span elements with the class "word" into an array
        wordsInSpan = $("p span.word, p span.whitespace");
    };

    //get the offsetTops of each span tag and filters them into an array
    function getOffsets() {
        //pushing offsetTop of each span.word into an array of offsetHeights
        for (var i = 0; i < wordsInSpan.length; i++) {
            //workaround for wacky space issue
            if (!$(wordsInSpan[i]).hasClass("whitespace")) {
                offsetHeights.push($(wordsInSpan[i]).offset().top);
            }
        }
        //round offsets to hundreths place (workaround)
        for (var i = 0; i < offsetHeights.length; i++) {
            offsetHeights[i] = Math.round(offsetHeights[i]);
        }
        console.log(offsetHeights)

        //removes duplicates offsets from offsetHeights and makes a filtered array(filteredOffsets)
        filteredOffsets = offsetHeights.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });
        filteredOffsets.sort(function (a, b) { return a - b });
    }

    //keep the highlighted line in the center block of the screen
    function keepLineInWindow() {
        line = $("span.word.highlighted");
        line[0].scrollIntoView({ block: "center" });
    };

    //attempting to select offsets that have the same offset (if that makes sense)
    function highlight() {
        console.log("index offset: " + filteredOffsets[index]);
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
        console.log($(wordsInSpan[spanIndex]).offset().top, $(line[0]).offset().top);
    }


    //whole program in one function 
    function setup() {
        wrapInSpans();
        console.log("wrapped spans");
        getOffsets();
        console.log("offsets got")
        highlight();
        console.log("highlited");
    }

    //actually run the program
    setup();
    
    //changes line selected with arrow keys
    $(document).keyup(function (e) {
        if (e.keyCode == 38 && index > 0) {
            index--;
            highlight();
        } else if (e.keyCode == 40 && index <= filteredOffsets.length) {
            index++;
            highlight();
            console.log($(wordsInSpan[5]).offset().top);
        }
    });

    //prevents arrowkeys from scrolling
    $(window).keydown(function (e) {
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
};
