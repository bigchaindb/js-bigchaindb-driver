// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import baseRequest from './baseRequest'
import sanitize from './sanitize'

const DEFAULT_REQUEST_CONFIG = {
    headers: {
        'Accept': 'application/json'
    }
}

const BACKOFF_DELAY = 0.5 // seconds

/**
 * @private
 * Small wrapper around js-utility-belt's request that provides url resolving,
 * default settings, and response handling.
 */


export default class Request {
    constructor(node, requestConfig) {
        this.node = node
        this.requestConfig = requestConfig
        this.backoffTime = null
        this.retries = 0
        this.connectionError = null
    }

    async request(endpoint, config, setTimeout) {
        // Load default fetch configuration and remove any falsy query parameters
        const requestConfig = Object.assign({}, this.node.headers, DEFAULT_REQUEST_CONFIG, config, {
            query: config.query && sanitize(config.query)
        })
        const apiUrl = this.node.endpoint + endpoint
        if (requestConfig.jsonBody) {
            requestConfig.headers = Object.assign({}, requestConfig.headers, {
                'Content-Type': 'application/json'
            })
        }

        if (!endpoint) {
            return Promise.reject(new Error('Request was not given a url.'))
        }

        // If `ConnectionError` occurs, a timestamp equal to now +
        // the default delay (`BACKOFF_DELAY`) is assigned to the object.
        // Next time the function is called, it either
        // waits till the timestamp is passed or raises `TimeoutError`.
        // If `ConnectionError` occurs two or more times in a row,
        // the retry count is incremented and the new timestamp is calculated
        // as now + the default delay multiplied by two to the power of the
        // number of retries.
        // If a request is successful, the backoff timestamp is removed,
        // the retry count is back to zero.

        const backoffTimedelta = this.getBackoffTimedelta()

        if (setTimeout != null && setTimeout < this.backoffTimedelta) {
            const errorObject = {
                message: 'TimeoutError'
            }
            throw errorObject
        }
        if (backoffTimedelta > 0) {
            await Request.sleep(backoffTimedelta)
        }
        this.timeout = setTimeout ? setTimeout - backoffTimedelta : setTimeout
        return baseRequest(apiUrl, requestConfig)
            .then(res => res.json())
            .catch(err => {
                // ConnectionError
                this.connectionError = err
                // throw err
            })
            .finally(() => {
                this.updateBackoffTime()
            })
    }

    getBackoffTimedelta() {
        if (!this.backoffTime) {
            return 0
        }
        return (this.backoffTime - Date.now())
    }

    updateBackoffTime() {
        if (!this.connectionError) {
            this.retries = 0
            this.backoffTime = null
        } else {
            const backoffTimedelta = BACKOFF_DELAY * (2 ** this.retries)
            this.backoffTime = Date.now() + backoffTimedelta
            this.retries += 1
        }
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
