window.onload = () => {

    // create a "global" ParagraphControllerModule to manage the paragraphs
    let ParagraphController = ParagraphControllerModule();

    const OneLine = OneLineModule(ParagraphController);

    OneLine.start();

    // should this be in OneLineModule? 
    $(document).keydown((e) => {
        ParagraphController.moveParagraph(e);
    });

}