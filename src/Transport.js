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
        return this.minBackoff()
    }

    minBackoff() {
        let connection = this.connectionPool[0]
        this.connectionPool.forEach(conn => {
            // 0 the lowest value is the time for Thu Jan 01 1970 01:00:00 GMT+0100 (CET)
            conn.backoffTime = conn.backoffTime ? conn.backoffTime : 0
            connection = (conn.backoffTime < connection.backoffTime) ? conn : connection
        })
        return connection
    }

    async forwardRequest(path, headers) {
        while (!this.timeout || this.timeout > 0) {
            const connection = this.pickConnection()

            // Date in milliseconds
            const startTime = Date.now()
            try {
                // TODO wait until request is done
                const response = connection.request(
                    path,
                    headers,
                    this.timeout
                )
                return response
            } catch (err) {
                throw err
            } finally {
                const elapsed = Date.now() - startTime
                if (this.timeout) {
                    this.timeout -= elapsed
                }
            }
        }
        throw new Error()
    }
}
