// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import 'core-js/features/object/entries'
import decamelize from 'decamelize'
import queryString from 'query-string'

/**
 * @private
 * imported from https://github.com/bigchaindb/js-utility-belt/
 *
 * Takes a key-value dictionary (ie. object) and converts it to a query-parameter string that you
 * can directly append into a URL.
 *
 * Extends queryString.stringify by allowing you to specify a `transform` function that will be
 * invoked on each of the dictionary's keys before being stringified into the query-parameter
 * string.
 *
 * By default `transform` is `decamelize`, so a dictionary of the form:
 *
 *   {
 *      page: 1,
 *      pageSize: 10
 *   }
 *
 * will be converted to a string like:
 *
 *   ?page=1&page_size=10
 *
 * @param  {Object}   obj                    Query params dictionary
 * @param  {function} [transform=decamelize] Transform function for each of the param keys
 * @return {string}                          Query param string
 */
export default function stringifyAsQueryParam(obj, transform = decamelize) {
    if (!obj || typeof obj !== 'object' || !Object.keys(obj).length) {
        return ''
    }

    const transformedKeysObj = Object.entries(obj).reduce((paramsObj, [key, value]) => {
        paramsObj[transform(key)] = value
        return paramsObj
    }, {})

    return `?${queryString.stringify(transformedKeysObj)}`
}
