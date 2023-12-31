const { merge } = require('webpack-merge')
const common = require('./webpack.common.cjs')
const webpack = require('webpack')
const dotenv = require('dotenv')
dotenv.config({ path: './.env.production' });

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env)
        }),
    ]
})
