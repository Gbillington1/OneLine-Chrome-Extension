const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const tailwindcss = require('tailwindcss')

// TODO: Finish webpack bundling of HTML, CSS, & Image assets
module.exports = {
    mode: 'development',
    entry: {
        contentScript: './src/js/OneLine-Main.js',
        background: './src/js/background/sw.js',
        defaultPopup: './src/js/popup/defaultPopup.js',
        colorSettingsPopup: './src/js/popup/colorSettings.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        // build & copy html files
        new HtmlWebpackPlugin({
            template: "./src/html/defaultPopup.html",
            filename: "html/defaultPopup.html",
            chunks: ['defaultPopup'], // Specify the associated JS bundle
        }),
        new HtmlWebpackPlugin({
            template: "./src/html/colorSettings.html",
            filename: "html/colorSettings.html",
            chunks: ['colorSettingsPopup'],  // Specify the associated JS bundle
        }),
        new HtmlWebpackPlugin({
            template: "./src/html/blobs/pageReloadPrompt.html",
            filename: "html/blobs/pageReloadPrompt.html",
            chunks: [""]
        }),
        new HtmlWebpackPlugin({
            template: "./src/html/blobs/openPDFInOneLinePopup.html",
            filename: "html/blobs/openPDFInOneLinePopup.html",
            chunks: [""]
        }),
        // copy css files
        new CopyWebpackPlugin({
            patterns: [
                { from: "./src/css", to: "css" },
                { from: "./src/images", to: "images" }
            ]
        })
    ],
    module: {
        rules: [
        ],
    },
    devtool: 'inline-source-map',
}
