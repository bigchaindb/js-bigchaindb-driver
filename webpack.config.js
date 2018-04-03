/* eslint-disable strict, no-console, object-shorthand */

'use strict'

const path = require('path')

const webpack = require('webpack')

const PRODUCTION = process.env.NODE_ENV === 'production'

const PATHS = {
    ENTRY: path.resolve(__dirname, './src/index.js'),
    BUNDLE: path.resolve(__dirname, 'dist/browser'),
    NODE_MODULES: path.resolve(__dirname, 'node_modules'),
}

const OUTPUTS = [
    {
        filename: PRODUCTION ? 'bigchaindb-driver.window.min.js' : 'bigchaindb-driver.window.js',
        library: 'BigchainDB',
        libraryTarget: 'window',
        path: PATHS.BUNDLE,
    },
    {
        filename: PRODUCTION ? 'bigchaindb-driver.umd.min.js' : 'bigchaindb-driver.umd.js',
        library: 'bigchaindb-driver',
        libraryTarget: 'umd',
        path: PATHS.BUNDLE,
    },
    {
        filename: PRODUCTION ? 'bigchaindb-driver.cjs.min.js' : 'bigchaindb-driver.cjs.js',
        library: 'bigchaindb-driver',
        libraryTarget: 'commonjs',
        path: PATHS.BUNDLE,
    },
    {
        filename: PRODUCTION ? 'bigchaindb-driver.cjs2.min.js' : 'bigchaindb-driver.cjs2.js',
        library: 'bigchaindb-driver',
        libraryTarget: 'commonjs2',
        path: PATHS.BUNDLE,
    },
    {
        filename: PRODUCTION ? 'bigchaindb-driver.amd.min.js' : 'bigchaindb-driver.amd.js',
        library: 'bigchaindb-driver',
        libraryTarget: 'amd',
        path: PATHS.BUNDLE,
    }
]


/** PLUGINS **/
const PLUGINS = [
    new webpack.NoEmitOnErrorsPlugin(),
]

const PROD_PLUGINS = [
    /*
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
    */
]

if (PRODUCTION) {
    PLUGINS.push(...PROD_PLUGINS)
}

const configBoilerplate = {
    entry: [PATHS.ENTRY],

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

/** EXPORTED WEBPACK CONFIG **/
const config = OUTPUTS.map(output => {
    const configCopy = Object.assign({}, configBoilerplate)
    configCopy.output = output
    return configCopy
})

module.exports = config
