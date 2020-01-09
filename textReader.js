$(document).ready(function () {
    //finds last word of line (line break detection)
    var breakWord
    var p = $('p');

    p.each(function () {
        var current = $(this);
        var text = current.text();

        var words = text.split(' ');

        current.text(words[0]);
        var height = current.height();

        for (var i = 1; i < words.length; i++) {
            current.text(current.text() + ' ' + words[i]);

            if (current.height() > height) {
                height = current.height();
                breakWord = words[i - 1];
                return breakWord;
            }
        }
        return current;
    });
    
    //highlights last word of line on hover
    $(function () {
        $('breakWord').hover(
            function () {
                var $this = $(this);
                $this.data('bgcolor',
                    $this.css('background-color')).css('background-color', 'yellow');
            },
            function () {
                var $this = $(this);
                $this.css('background-color', $this.data('bgcolor'));
            }
        );
    })
});
