/* eslint-disable strict, no-console, object-shorthand */

'use strict'

const path = require('path')

const webpack = require('webpack')

const PRODUCTION = process.env.NODE_ENV === 'production'

const PATHS = {
    ENTRY: path.resolve(__dirname, './src/index.js'),
    BUNDLE: path.resolve(__dirname, 'dist/bundle'),
    NODE_MODULES: path.resolve(__dirname, 'node_modules'),
}


/** PLUGINS **/
const PLUGINS = [
    new webpack.NoEmitOnErrorsPlugin(),
]

const PROD_PLUGINS = [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
        },
        output: {
            comments: false,
        },
        sourceMap: true,
    }),
    new webpack.LoaderOptionsPlugin({
        debug: false,
        minimize: true,
    }),
]

if (PRODUCTION) {
    PLUGINS.push(...PROD_PLUGINS)
}


/** EXPORTED WEBPACK CONFIG **/
const config = {
    entry: [PATHS.ENTRY],

    output: {
        filename: PRODUCTION ? 'bundle.min.js' : 'bundle.js',
        library: 'js-bigchaindb-driver',
        libraryTarget: 'umd',
        path: PATHS.BUNDLE,
    },

    devtool: PRODUCTION ? '#source-map' : '#inline-source-map',

    resolve: {
        extensions: ['.js'],
        modules: ['node_modules'], // Don't use absolute path here to allow recursive matching
    },

    plugins: PLUGINS,

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [PATHS.NODE_MODULES],
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    },
                }],
            },
        ],
    },
}

module.exports = config
