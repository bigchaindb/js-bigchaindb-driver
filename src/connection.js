// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import Transport from './transport'

const HEADER_BLACKLIST = ['content-type']
const DEFAULT_NODE = 'http://localhost:9984'
/**
 * If initialized with ``>1`` nodes, the driver will send successive
    requests to different nodes in a round-robin fashion (this will be
    customizable in the future)
 *
 * @nodes
 * list of
 *
 * @headers
 *
 *
 */
export default class Connection {
    constructor(nodes, headers = {}, timeout = null) {
        const nodesArray = Array.isArray(nodes) ? nodes : [nodes]
        // Copy object
        this.headers = Object.assign({}, headers)

        // Validate headers
        Object.keys(headers).forEach(header => {
            if (HEADER_BLACKLIST.includes(header.toLowerCase())) {
                throw new Error(`Header ${header} is reserved and cannot be set.`)
            }
        })

        this.normalizedNodes = []
        if (!nodesArray) {
            this.normalizedNodes.push(Connection.normalizeNode(DEFAULT_NODE, this.headers))
        } else {
            nodesArray.forEach(node => {
                this.normalizedNodes.push(Connection.normalizeNode(node, this.headers))
            })
        }
        this.transport = new Transport(this.normalizedNodes, this.headers, timeout)
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
