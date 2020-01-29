$(document).ready(function () {
    var p = $('p');

    p.each(function () {
        var current = $(this);
        var text = current.text();

        var words = text.split(' ');

        for (var i = 0; i < words.length; i++) {
            current.append(' <span>' + words[i] + '</span> ');
        }
        var wordsInSpan = current.find('span');

        var offsetHeights = [];
        //for each word, compare it's offsetTop to the next words offsetTop, and push offset into offsetHeights
        words.forEach(function () {
            for (var i = 0; i < words.length - 1; i++) {
                if (wordsInSpan[i].offsetTop == wordsInSpan[i + 1].offsetTop) {
                    offsetHeights.push(wordsInSpan[i].offsetTop);
                }
            }
            return offsetHeights;
        });

        //removes duplicate offsets from offsetHeights and makes a filtered array (filteredOffsets)
        //i have no idea how this code (below) works, but it does
        var filteredOffsets = offsetHeights.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        var index = 0;

        //changes indexes (line selected) with arrow keys
        document.addEventListener("keyup", function (e) {
            if (e.keyCode == 38) {
                index--;
                console.log(index);
            }
            if (e.keyCode == 40) {
                index++;
                console.log(index);
            }
        })

        //code to highlight each line (not working)
        filteredOffsets.forEach(function () {
            for (var i = 0; i < filteredOffsets.length; i++) {
                if (filteredOffsets[i] == filteredOffsets[index]) {
                    //highlight line here
                    console.log("selected index: " + filteredOffsets[index]);
                }
            }
        });


        //var words = ["test", "word"]
        //foreach words if(offsetHeights[i] does not contains 340)
        //add 340 to my list
        //var offsetHeights = [340, 356, 372]
        //var offsetHeights[3]

        //foreach (word)
        // if(words[i].offsetHeight = offsetHeights[3])
        // hilight
    });
});
