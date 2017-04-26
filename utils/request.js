import { request as baseRequest, sanitize } from 'js-utility-belt/es6';

import ApiUrls from '../constants/api_urls';


const DEFAULT_REQUEST_CONFIG = {
    credentials: 'include',
    headers: {
        'Accept': 'application/json'
    }
};

/**
 * Small wrapper around js-utility-belt's request that provides url resolving, default settings, and
 * response handling.
 */
export default function request(url, config = {}) {
    // Load default fetch configuration and remove any falsy query parameters
    const requestConfig = Object.assign({}, DEFAULT_REQUEST_CONFIG, config, {
        query: config.query && sanitize(config.query)
    });
    let apiUrl = url;

    if (requestConfig.jsonBody) {
        requestConfig.headers = Object.assign({}, requestConfig.headers, {
            'Content-Type': 'application/json'
        });
    }
    if (!url) {
        return Promise.reject(new Error('Request was not given a url.'));
    } else if (!url.match(/^http/)) {
        apiUrl = ApiUrls[url];
        if (!apiUrl) {
            return Promise.reject(new Error(`Request could not find a url mapping for "${url}"`));
        }
    }

    return baseRequest(apiUrl, requestConfig)
        .then((res) => res.json())
        .catch((err) => {
            console.error(err);
            throw err;
        });
}
