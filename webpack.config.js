const path = require("path")
// TODO: Finish webpack bundling of HTML, CSS, & Image assets
module.exports = {
    mode: 'development',
    entry: {
        contentScript: './src/js/OneLine-Main.js',
        background: './src/js/background/sw.js',
        defaultPopup: './src/js/popup/defaultPopup.js',
        colorSettingsPopup: './src/js/popup/colorSettings.js',
        // utils: [
        //     './src/js/utils/globalUtils',
        //     './src/js/utils/csUtils.js',
        //     './src/js/utils/popupUtils.js'
        // ],
    },
    devtool: 'inline-source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    }
}
