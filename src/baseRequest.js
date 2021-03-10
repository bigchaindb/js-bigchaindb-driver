// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import { Promise } from 'es6-promise'
import fetchPonyfill from 'fetch-ponyfill'
import { vsprintf } from 'sprintf-js'

import formatText from './format_text'
import stringifyAsQueryParam from './stringify_as_query_param'

const fetch = fetchPonyfill(Promise)

export function ResponseError(message, status, requestURI) {
    this.name = 'ResponseError'
    this.message = message
    this.status = status
    this.requestURI = requestURI
    this.stack = (new Error()).stack
}

ResponseError.prototype = new Error()

/**
 * @private
 * Timeout function following https://github.com/github/fetch/issues/175#issuecomment-284787564
 * @param {integer} obj Source object
 * @param {Promise} filter Array of key names to select or function to invoke per iteration
 * @return {Object} TimeoutError if the time was consumed, otherwise the Promise will be resolved
 */
function timeout(ms, promise) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const errorObject = {
                message: 'TimeoutError'
            }
            reject(new Error(errorObject))
        }, ms)
        promise.then(resolve, reject)
    })
}

/**
 * @private
 * @param {Promise} res Source object
 * @return {Promise} Promise that will resolve with the response if its status was 2xx;
 *                          otherwise rejects with the response
 */
function handleResponse(res) {
    // If status is not a 2xx (based on Response.ok), assume it's an error
    // See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
    if (!(res && res.ok)) {
        throw new ResponseError(
            'HTTP Error: Requested page not reachable',
            `${res.status} ${res.statusText}`,
            res.url
        )
    }
    return res
}

/**
 * @private
 * imported from https://github.com/bigchaindb/js-utility-belt/
 *
 * Global fetch wrapper that adds some basic error handling and ease of use enhancements.
 * Considers any non-2xx response as an error.
 *
 * For more information on fetch, see https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch.
 *
 * Expects fetch to already be available (either in a ES6 environment, bundled through webpack, or
 * injected through a polyfill).
 *
 * @param  {string}  url    Url to request. Can be specified as a sprintf format string (see
 *                          https://github.com/alexei/sprintf.js) that will be resolved using
 *                          `config.urlTemplateSpec`.
 * @param  {Object}  config Additional configuration, mostly passed to fetch as its 'init' config
 *                          (see https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters).
 * @param  {*}             config.jsonBody        Json payload to the request. Will automatically be
 *                                                JSON.stringify()-ed and override `config.body`.
 * @param  {string|Object} config.query           Query parameter to append to the end of the url.
 *                                                If specified as an object, keys will be
 *                                                decamelized into snake case first.
 * @param  {*[]|Object}    config.urlTemplateSpec Format spec to use to expand the url (see sprintf).
 * @param  {*}             config.*               All other options are passed through to fetch.
 * @param  {integer}         requestTimeout         Timeout for a single request
 *
 * @return {Promise}        If requestTimeout the timeout function will be called. Otherwise resolve the
 *                          Promise with the handleResponse function
 */
export default function baseRequest(url, {
    jsonBody,
    query,
    urlTemplateSpec,
    ...fetchConfig
} = {}, requestTimeout) {
    let expandedUrl = url

    if (urlTemplateSpec != null) {
        if (Array.isArray(urlTemplateSpec) && urlTemplateSpec.length) {
            // Use vsprintf for the array call signature
            expandedUrl = vsprintf(url, urlTemplateSpec)
        } else if (urlTemplateSpec &&
            typeof urlTemplateSpec === 'object' &&
            Object.keys(urlTemplateSpec).length) {
            expandedUrl = formatText(url, urlTemplateSpec)
        } else if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('Supplied urlTemplateSpec was not an array or object. Ignoring...')
        }
    }

    if (query != null) {
        if (typeof query === 'string') {
            expandedUrl += query
        } else if (query && typeof query === 'object') {
            expandedUrl += stringifyAsQueryParam(query)
        } else if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('Supplied query was not a string or object. Ignoring...')
        }
    }

    if (jsonBody != null) {
        fetchConfig.body = JSON.stringify(jsonBody)
    }
    if (requestTimeout) {
        return timeout(requestTimeout, fetch.fetch(expandedUrl, fetchConfig))
            .then(handleResponse)
    } else {
        return fetch.fetch(expandedUrl, fetchConfig)
            .then(handleResponse)
    }
}
