// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/* eslint-disable strict, no-console, object-shorthand, import/no-extraneous-dependencies */

'use strict'

const path = require('path')
const { merge } = require('webpack-merge')

const development = require('./webpack.development.js')
const production = require('./webpack.production.js')

const AddVendorsPlugin = require('./plugins/add-vendors-plugin')

const paths = {
    entry: path.resolve(__dirname, './src/index.js'),
    bundle: path.resolve(__dirname, 'dist/browser'),
}

const outputs = (base, env, mapping, overrides) => {
    const collection = []
    const library = 'bigchaindb-driver'
    const windowLibrary = 'BigchainDB'

    let environment = development
    let ext = 'js'

    if (env === 'production') {
        environment = production
        ext = `min.${ext}`
    }

    Object.entries(mapping).forEach(([target, extension]) => {
        const filename = `[name].${library}.${extension}.${ext}`

        const compiled = {
            output: {
                filename: filename,
                library: target === 'window' ? windowLibrary : library,
                libraryTarget: target,
                path: paths.bundle
            },
            plugins: [
                new AddVendorsPlugin(`${library}.${extension}.${ext}`)
            ]
        }

        collection.push(merge(base, environment, compiled, overrides))
    })

    return collection
}

module.exports = {
    outputs,
    paths
}
