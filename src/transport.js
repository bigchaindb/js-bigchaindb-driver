// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import Request from './request'


export default class Transport {
    constructor(nodes, headers, timeout) {
        this.connectionPool = []
        this.timeout = timeout
        nodes.forEach(node => {
            this.connectionPool.push(new Request(node, headers))
        })
    }

    // Select the connection with the earliest backoff time
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
        while (!this.timeout || this.timeout > 0) {
            connection = this.pickConnection()
            // Date in milliseconds
            const startTime = Date.now()
            try {
                // eslint-disable-next-line no-await-in-loop
                response = await connection.request(
                    path,
                    headers,
                    this.timeout
                )
                const elapsed = Date.now() - startTime
                if (connection.backoffTime) {
                    this.timeout += elapsed
                } else {
                    return response
                }

                if (connection.retries > 3) {
                    throw connection.connectionError
                }
            } catch (err) {
                throw err
            }
        }
        const errorObject = {
            message: 'Timeout error',
        }
        throw errorObject
    }
}
