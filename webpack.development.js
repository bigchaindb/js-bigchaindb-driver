// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

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
