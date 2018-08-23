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
    }

    async request(endpoint, config, timeout) {
        // Num or retries to the same node
        this.retries = 0
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
        // The timestamp is in UTC. Next time the function is called, it either
        // waits till the timestamp is passed or raises `TimeoutError`.
        // If `ConnectionError` occurs two or more times in a row,
        // the retry count is incremented and the new timestamp is calculated
        // as now + the default delay multiplied by two to the power of the
        // number of retries.
        // If a request is successful, the backoff timestamp is removed,
        // the retry count is back to zero.

        this.backoffTimedelta = this.getBackoffTimedelta()

        if (timeout != null && timeout < this.backoffTimedelta) {
            throw new Error()
        }
        if (this.backoffTimedelta > 0) {
            await Request.sleep(this.backoffTimedelta)
        }
        this.timeout = this.timeout ? this.timeout - this.backoffTimedelta : timeout

        return baseRequest(apiUrl, requestConfig)
            .then(res => async function handleResponse() {
                res.json()
                if (!(res.status >= 200 && res.status < 300)) {
                    console.log('Valid response')
                }
            })
            .catch(err => {
                throw err
            })
            .finally((res) => {
                this.updateBackoffTime(res)
            })
    }

    getBackoffTimedelta() {
        if (!this.backoffTime) {
            return 0
        }
        return (this.backoffTime - Date.now())
    }

    updateBackoffTime(success) {
        if (success) {
            this.retries = 0
            this.backoffTime = null
        } else {
            this.backoffTimedelta = BACKOFF_DELAY * (2 ** this.retries)
            this.backoffTime = Date.now() + this.backoffTimedelta
            this.retries += 1
        }
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
