// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import Request from './request'


/**
 *
 * @private
 * If initialized with ``>1`` nodes, the driver will send successive
 * requests to different nodes in a round-robin fashion (this will be
 * customizable in the future).
 */


export default class Transport {
    constructor(nodes, headers, timeout) {
        this.connectionPool = []
        this.timeout = timeout
        // the maximum backoff time is 10 seconds
        this.maxBackoffTime = timeout ? timeout / 10 : 10000
        nodes.forEach(node => {
            this.connectionPool.push(new Request(node, headers))
        })
    }

    // Select the connection with the earliest backoff time, in case of a tie,
    // prefer the one with the smaller list index
    pickConnection() {
        if (this.connectionPool.length === 1) {
            return this.connectionPool[0]
        }
        let connection = this.connectionPool[0]

        this.connectionPool.forEach(conn => {
            // 0 the lowest value is the time for Thu Jan 01 1970 01:00:00 GMT+0100 (CET)
            conn.backoffTime = conn.backoffTime ? conn.backoffTime : 0
            connection = (conn.backoffTime < connection.backoffTime) ? conn : connection
        })
        return connection
    }

    async forwardRequest(path, headers) {
        let response
        let connection
        // A new request will be executed until there is a valid response or timeout < 0
        while (!this.timeout || this.timeout > 0) {
            connection = this.pickConnection()
            // Date in milliseconds
            const startTime = Date.now()
            try {
                // eslint-disable-next-line no-await-in-loop
                response = await connection.request(
                    path,
                    headers,
                    this.timeout,
                    this.maxBackoffTime
                )
                const elapsed = Date.now() - startTime
                if (connection.backoffTime) {
                    this.timeout -= elapsed
                } else {
                    // No connection error, the response is valid
                    return response
                }
            } catch (err) {
                throw err
            }
        }
        const errorObject = {
            message: 'TimeoutError',
        }
        throw connection.connectionError ? connection.connectionError : errorObject
    }
}
