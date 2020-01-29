$(document).ready(function () {

    //changes indexes (line selected) with arrow keys
    document.addEventListener("keyup", function (e) {
        if (e.keyCode == 38 && index >= 1) {
            index--;
            console.log(index);
        }
        if (e.keyCode == 40) {
            index++;
            console.log(index);
        }
    });

    var index = 0;

    var p = $('p');

    p.each(function () {
        var current = $(this);

        var text = current.text();

        var words = text.split(' ');

        for (var i = 0; i < words.length; i++) {

            current.append(' <span>' + words[i] + '</span> ');

        }
        
        var wordsInSpan = current.find('span');
        console.log(wordsInSpan);
        var offsetHeights = [];
        //for each word, compare it's offsetTop to the next words offsetTop, and push offset into offsetHeights
        words.forEach(function () {
            offsetHeights.push(this.offsetTop); 
            // for (var i = 0; i < words.length - 1; i++) {
            //     if (words[i].offsetTop == words[i + 1].offsetTop) {
            //         offsetHeights.push(words[i].offsetTop);
            //     }
            // }
            // return offsetHeights;
        });

        //removes duplicate offsets from offsetHeights and makes a filtered array (filteredOffsets)
        //i have no idea how this code (below) works, but it does
        var filteredOffsets = offsetHeights.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        //code to highlight each line (not working)
        words.forEach(function () {
            if (this.offsetTop == filteredOffsets[index]) {
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
