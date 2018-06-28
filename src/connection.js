import request from './request'

const HEADER_BLACKLIST = ['content-type']

/**
 * Base connection
 */
export default class Connection {
    constructor(path, headers = {}) {
        this.path = path
        this.headers = Object.assign({}, headers)

        Object.keys(headers).forEach(header => {
            if (HEADER_BLACKLIST.includes(header.toLowerCase())) {
                throw new Error(`Header ${header} is reserved and cannot be set.`)
            }
        })
    }

    getApiUrls(endpoint) {
        return this.path + {
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

    _req(path, options = {}) {
        // NOTE: `options.headers` could be undefined, but that's OK.
        options.headers = Object.assign({}, options.headers, this.headers)
        return request(path, options)
    }

    /**
     * @param blockHeight
     */
    getBlock(blockHeight) {
        return this._req(this.getApiUrls('blocksDetail'), {
            urlTemplateSpec: {
                blockHeight
            }
        })
    }

    /**
     * @param transactionId
     */
    getTransaction(transactionId) {
        return this._req(this.getApiUrls('transactionsDetail'), {
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
        return this._req(this.getApiUrls('blocks'), {
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
        return this._req(this.getApiUrls('outputs'), {
            query
        })
    }

    /**
     * @param assetId
     * @param operation
     */
    listTransactions(assetId, operation) {
        return this._req(this.getApiUrls('transactions'), {
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
        return this._req(this.getApiUrls('votes'), {
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
        return this._req(this.getApiUrls('transactionsSync'), {
            method: 'POST',
            jsonBody: transaction
        })
    }


    /**
     * @param transaction
     */
    postTransactionAsync(transaction) {
        return this._req(this.getApiUrls('transactionsAsync'), {
            method: 'POST',
            jsonBody: transaction
        })
    }


    /**
     * @param transaction
     */
    postTransactionCommit(transaction) {
        return this._req(this.getApiUrls('transactionsCommit'), {
            method: 'POST',
            jsonBody: transaction
        })
    }

    /**
     * @param search
     */
    searchAssets(search) {
        return this._req(this.getApiUrls('assets'), {
            query: {
                search
            }
        })
    }

    /**
     * @param search
     */
    searchMetadata(search) {
        return this._req(this.getApiUrls('metadata'), {
            query: {
                search
            }
        })
    }
}
