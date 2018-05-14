import baseRequest from './baseRequest'
import sanitize from './sanitize'

const DEFAULT_REQUEST_CONFIG = {
    headers: {
        'Accept': 'application/json'
    }
}

/**
 * @private
 * Small wrapper around js-utility-belt's request that provides url resolving,
 * default settings, and response handling.
 */
export default function request(url, config = {}) {
    // Load default fetch configuration and remove any falsy query parameters
    const requestConfig = Object.assign({}, DEFAULT_REQUEST_CONFIG, config, {
        query: config.query && sanitize(config.query)
    })
    const apiUrl = url

    if (requestConfig.jsonBody) {
        requestConfig.headers = Object.assign({}, requestConfig.headers, {
            'Content-Type': 'application/json'
        })
    }

    if (!url) {
        return Promise.reject(new Error('Request was not given a url.'))
    }

    return baseRequest(apiUrl, requestConfig)
        .then(res => res.json())
        .catch(err => {
            console.error(err)
            throw err
        })
}
