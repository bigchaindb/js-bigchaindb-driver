// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/* eslint-disable strict, no-console, object-shorthand, import/no-extraneous-dependencies */

'use strict'

const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
    devtool: 'inline-source-map',
    optimization: {
        minimizer: [
            new TerserPlugin({
                test: /vendor/,
                sourceMap: false
            }),
            new TerserPlugin({
                test: /^((?!(vendor)).)*.js$/,
                sourceMap: false
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
        }
    }
}
