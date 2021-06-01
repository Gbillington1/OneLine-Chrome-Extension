window.onload = () => {

    // create a "global" ParagraphControllerModule to manage the paragraphs
    let ParagraphController = ParagraphControllerModule();

    const OneLine = OneLineModule(ParagraphController);

    OneLine.start();    

    // should this be in OneLineModule? 
    $(document).keydown((e) => {
        // don't move line when user is editing text in <input> or <textarea> 
        if (!$(e.target).is("input, textarea")) {
            e.preventDefault();
            ParagraphController.moveParagraph(e);
        }
    });

}