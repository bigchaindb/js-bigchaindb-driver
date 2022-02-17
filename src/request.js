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

const BACKOFF_DELAY = 500 // 0.5 seconds
const ERROR_FROM_SERVER = 'HTTP Error: Requested page not reachable'
/**
 * @private
 * Small wrapper around js-utility-belt's request that provides url resolving,
 * default settings, and response handling.
 */

export default class Request {
    constructor(node) {
        this.node = node
        this.backoffTime = null
        this.retries = 0
        this.connectionError = null
    }

    async request(urlPath, config, timeout, maxBackoffTime) {
        if (!urlPath) {
            return Promise.reject(new Error('Request was not given a url.'))
        }
        // Load default fetch configuration and remove any falsy query parameters
        const requestConfig = {
            ...this.node.headers,
            ...DEFAULT_REQUEST_CONFIG,
            ...config,
            query: config.query && sanitize(config.query)
        }
        const apiUrl = this.node.endpoint + urlPath
        if (requestConfig.jsonBody) {
            requestConfig.headers = { ...requestConfig.headers, 'Content-Type': 'application/json' }
        }

        // If connectionError occurs, a timestamp equal to now +
        // `backoffTimedelta` is assigned to the object.
        // Next time the function is called, it either
        // waits till the timestamp is passed or raises `TimeoutError`.
        // If `ConnectionError` occurs two or more times in a row,
        // the retry count is incremented and the new timestamp is calculated
        // as now + the `backoffTimedelta`
        // The `backoffTimedelta` is the minimum between the default delay
        // multiplied by two to the power of the
        // number of retries or timeout/2 or 10. See Transport class for that
        // If a request is successful, the backoff timestamp is removed,
        // the retry count is back to zero.

        const backoffTimedelta = this.getBackoffTimedelta()

        if (timeout != null && timeout < backoffTimedelta) {
            const errorObject = {
                message: 'TimeoutError'
            }
            throw errorObject
        }
        if (backoffTimedelta > 0) {
            await Request.sleep(backoffTimedelta)
        }

        const requestTimeout = timeout ? timeout - backoffTimedelta : timeout
        return baseRequest(apiUrl, requestConfig, requestTimeout)
            .then((res) => {
                this.connectionError = null
                return res.json()
            })
            .catch(err => {
                // ConnectionError
                this.connectionError = err
            })
            .finally(() => {
                this.updateBackoffTime(maxBackoffTime)
            })
    }

    updateBackoffTime(maxBackoffTime) {
        if (!this.connectionError) {
            this.retries = 0
            this.backoffTime = null
        } else if (this.connectionError.message === ERROR_FROM_SERVER) {
            // If status is not a 2xx (based on Response.ok), throw error
            this.retries = 0
            this.backoffTime = null
            throw this.connectionError
        } else {
            // Timeout or no connection could be stablished
            const backoffTimedelta = Math.min(BACKOFF_DELAY * (2 ** this.retries), maxBackoffTime)
            this.backoffTime = Date.now() + backoffTimedelta
            this.retries += 1
            if (this.connectionError.message === 'TimeoutError') {
                throw this.connectionError
            }
        }
    }

    getBackoffTimedelta() {
        if (!this.backoffTime) {
            return 0
        }
        return (this.backoffTime - Date.now())
    }

    static sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }
}
