const { merge } = require('webpack-merge')
const common = require('./webpack.common.cjs')
const webpack = require('webpack')
const dotenv = require('dotenv')
dotenv.config({ path: './.env.development' });

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env)
        }),
    ]
})
