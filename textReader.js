$(document).ready(function () {
    var index = 0;
    var p = $('p');
    var offsetHeights = [];
    p.each(function () {
        var current = $(this);

        var text = current.text();

        var words = text.split(' ');

        current.empty();

        for (var i = 0; i < words.length; i++) {
            current.append(' <span>' + words[i] + '</span>');
        }
    });

    var wordsInSpan = $('p span');

    //for span tag within a p, push its offsetTop into offsetHeights
    wordsInSpan.each(function () {
        offsetHeights.push(this.offsetTop);
    });

    //removes duplicates offsets from offsetHeights and makes a filtered array(filteredOffsets)
    var filteredOffsets = offsetHeights.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
    });

    //code to highlight each line
    function highlight() {
        wordsInSpan.each(function () {
            if (this.offsetTop === filteredOffsets[index]) {
                //figure out what to replace (index) with because it isnt right
                //it should be the index that selects all spans with same offset value as filteredOffsets[index]
                wordsInSpan.eq(index).addClass("highlighted");
                var highlighted = document.getElementsByClassName("highlighted");
                for (var i = 0; i < highlighted.length; i++) {
                    highlighted[i].style.backgroundColor = "yellow";
                }
                console.log('hilighting line at offset ' + this.offsetTop);
            }
        });
    };

    highlight();

    //changes indexes (line selected) with arrow keys
    document.addEventListener("keyup", function (e) {
        if (e.keyCode == 38 && index >= 1) {
            index--;
            highlight();
            console.log(index);
        }
        if (e.keyCode == 40) {
            index++;
            highlight();
            console.log(index);
        }
    });

    window.addEventListener("keydown", function(e) {
        // space and arrow keys
        if([38, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

});
