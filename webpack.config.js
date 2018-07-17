/* eslint-disable strict, no-console, object-shorthand */

'use strict'

const PRODUCTION = process.env.NODE_ENV === 'production'

const common = require('./webpack.common.js')

const { outputs } = require('./webpack.parts.js')

// '[libraryTarget]': [file extension]
const OUTPUT_MAPPING = {
    'amd': 'amd',
    'commonjs': 'cjs',
    'commonjs2': 'cjs2',
    'umd': 'umd',
    'window': 'window',
}

const OVERRIDES = {
    // optimization: {
    //     minimize: false
    // }
}

if (PRODUCTION) {
    module.exports = outputs(common, 'production', OUTPUT_MAPPING, OVERRIDES)
} else {
    module.exports = outputs(common, 'development', OUTPUT_MAPPING, OVERRIDES)
}
