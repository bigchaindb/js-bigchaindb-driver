/* eslint-disable strict, no-console, object-shorthand */

'use strict'

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    devtool: 'inline-source-map',
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                test: /vendor/,
                sourceMap: false,
            }),
            new UglifyJsPlugin({
                test: /^((?!(vendor)).)*.js$/,
                sourceMap: true,
            })
        ],
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        },
    },
}
