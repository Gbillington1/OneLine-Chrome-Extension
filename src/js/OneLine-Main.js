window.onload = () => {

    // create a "global" paragraphController class to pass into the OneLine class
    let paragraphController = new ParagraphController();

    OneLine.start(paragraphController); 

    $(document).keydown((e) => {
        paragraphController.moveParagraph(e);
    });

}