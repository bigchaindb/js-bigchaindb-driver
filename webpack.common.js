// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/* eslint-disable strict, no-console, object-shorthand */

'use strict'

const { paths } = require('./webpack.parts.js')

module.exports = {
    entry: paths.entry,
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            }
        ]
    },
    optimization: {
        minimize: true,
        noEmitOnErrors: true
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules'],
    },
}
