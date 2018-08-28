// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import Transport from './transport'

const HEADER_BLACKLIST = ['content-type']
const DEFAULT_NODE = 'http://localhost:9984/api/v1/'

/**
 *
 * @param  {String, Array}  nodes    Nodes for the connection. String possible to be backwards compatible
 *                                   with version before 4.1.0 version
 * @param  {Object}  headers         Common headers for every request
 * @param  {float}  timeout          Optional timeout in secs
 *
 *
 */

export default class Connection {
    // 20 seconds is the default value for a timeout if not specified
    constructor(nodes, headers = {}, timeout = 20000) {
        // Copy object
        this.headers = Object.assign({}, headers)

        // Validate headers
        Object.keys(headers).forEach(header => {
            if (HEADER_BLACKLIST.includes(header.toLowerCase())) {
                throw new Error(`Header ${header} is reserved and cannot be set.`)
            }
        })

        this.normalizedNodes = []
        if (!nodes) {
            this.normalizedNodes.push(Connection.normalizeNode(DEFAULT_NODE, this.headers))
        } else if (Array.isArray(nodes)) {
            nodes.forEach(node => {
                this.normalizedNodes.push(Connection.normalizeNode(node, this.headers))
            })
        } else {
            this.normalizedNodes.push(Connection.normalizeNode(nodes, this.headers))
        }

        this.transport = new Transport(this.normalizedNodes, timeout) // TODO
    }

    static normalizeNode(node, headers) {
        if (typeof node === 'string') {
            return { 'endpoint': node, 'headers': headers }
        } else {
            // TODO normalize URL if needed
            const allHeaders = Object.assign({}, headers, node.headers)
            return { 'endpoint': node.endpoint, 'headers': allHeaders }
        }
    }

    static getApiUrls(endpoint) {
        return {
            'blocks': 'blocks',
            'blocksDetail': 'blocks/%(blockHeight)s',
            'outputs': 'outputs',
            'transactions': 'transactions',
            'transactionsSync': 'transactions?mode=sync',
            'transactionsAsync': 'transactions?mode=async',
            'transactionsCommit': 'transactions?mode=commit',
            'transactionsDetail': 'transactions/%(transactionId)s',
            'assets': 'assets',
            'metadata': 'metadata',
            'votes': 'votes'
        }[endpoint]
    }

    _req(pathEndpoint, options = {}) {
        return this.transport.forwardRequest(pathEndpoint, options)
    }

    /**
     * @param blockHeight
     */
    getBlock(blockHeight) {
        return this._req(Connection.getApiUrls('blocksDetail'), {
            urlTemplateSpec: {
                blockHeight
            }
        })
    }

    /**
     * @param transactionId
     */
    getTransaction(transactionId) {
        return this._req(Connection.getApiUrls('transactionsDetail'), {
            urlTemplateSpec: {
                transactionId
            }
        })
    }

    /**
     * @param transactionId
     * @param status
     */
    listBlocks(transactionId) {
        return this._req(Connection.getApiUrls('blocks'), {
            query: {
                transaction_id: transactionId,
            }
        })
    }

    /**
     * @param publicKey
     * @param spent
     */
    listOutputs(publicKey, spent) {
        const query = {
            public_key: publicKey
        }
        // NOTE: If `spent` is not defined, it must not be included in the
        // query parameters.
        if (spent !== undefined) {
            query.spent = spent.toString()
        }
        return this._req(Connection.getApiUrls('outputs'), {
            query
        })
    }

    /**
     * @param assetId
     * @param operation
     */
    listTransactions(assetId, operation) {
        return this._req(Connection.getApiUrls('transactions'), {
            query: {
                asset_id: assetId,
                operation
            }
        })
    }

    /**
     * @param blockId
     */
    listVotes(blockId) {
        return this._req(Connection.getApiUrls('votes'), {
            query: {
                block_id: blockId
            }
        })
    }

    /**
     * @param transaction
     */
    postTransaction(transaction) {
        return this.postTransactionCommit(transaction)
    }

    /**
     * @param transaction
     */
    postTransactionSync(transaction) {
        return this._req(Connection.getApiUrls('transactionsSync'), {
            method: 'POST',
            jsonBody: transaction
        })
    }


    /**
     * @param transaction
     */
    postTransactionAsync(transaction) {
        return this._req(Connection.getApiUrls('transactionsAsync'), {
            method: 'POST',
            jsonBody: transaction
        })
    }


    /**
     * @param transaction
     */
    postTransactionCommit(transaction) {
        return this._req(Connection.getApiUrls('transactionsCommit'), {
            method: 'POST',
            jsonBody: transaction
        })
    }

    /**
     * @param search
     */
    searchAssets(search) {
        return this._req(Connection.getApiUrls('assets'), {
            query: {
                search
            }
        })
    }

    /**
     * @param search
     */
    searchMetadata(search) {
        return this._req(Connection.getApiUrls('metadata'), {
            query: {
                search
            }
        })
    }
}
