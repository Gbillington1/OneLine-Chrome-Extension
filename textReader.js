$(document).ready(function () {
    //globals
    var index = 0;
    var wordsInSpan;
    var filteredOffsets;
    var offsetHeights = [];

    function wrapInSpans() {
        var paras = $('p');
        for (var i = 0; i < paras.length; i++) {
            var results = Splitting({ target: paras[i], by: "words" });
        }

        //puts all span elements with the class "word" into an array
        wordsInSpan = $("p span.word, p span.whitespace");

        //pushing offsetTop of each span.word into an array of offsetHeights
        for (var i = 0; i < wordsInSpan.length; i++) {
            offsetHeights.push(wordsInSpan[i].offsetTop);   
        }

        //removes duplicates offsets from offsetHeights and makes a filtered array(filteredOffsets)
        filteredOffsets = offsetHeights.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });
    };

    //attempting to select offsets that have the same offset (if that makes sense)
    function highlight() {
        for (var i = 0; i < wordsInSpan.length; i++) {

            if (wordsInSpan[i].offsetTop === filteredOffsets[index]) {
                $(wordsInSpan[i]).addClass("highlighted");
            } else {
                $(wordsInSpan[i]).removeClass("highlighted");
            }
        }
    }

    function setup() {
        wrapInSpans();
        highlight();
    }

    setup();

    //changes line selected with arrow keys
    $(document).keyup(function (e) {
        if (e.which == 38 && index > 0) {
            index--;
            highlight();
        } else if (e.which == 40 && index <= filteredOffsets.length) {
            index++;
            highlight();
        }
    });

    //prevents arrowkeys from scrolling
    $(window).keydown(function (e) {
        if (keyCode == 38 || keyCode == 40){
            e.preventDefault();
        }
    });
    
    //resets program on window resize
    $(window).resize(function() {
        //function to remove spans here
        setup();
    });

});
