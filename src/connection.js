import request from './request'


const HEADER_BLACKLIST = ['content-type']


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
            'blocksDetail': 'blocks/%(blockId)s',
            'outputs': 'outputs',
            'statuses': 'statuses',
            'transactions': 'transactions',
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
     * @public
     * @param blockId
     */
    getBlock(blockId) {
        return this._req(this.getApiUrls('blocksDetail'), {
            urlTemplateSpec: {
                blockId
            }
        })
    }

    /**
     * @public
     * @param transactionId
     */
    getStatus(transactionId) {
        return this._req(this.getApiUrls('statuses'), {
            query: {
                transaction_id: transactionId
            }
        })
    }

    /**
     * @public
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
     * @public
     * @param transactionId
     * @param status
     */
    listBlocks(transactionId, status) {
        return this._req(this.getApiUrls('blocks'), {
            query: {
                transaction_id: transactionId,
                status
            }
        })
    }

    /**
     * @public
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
     * @public
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
     * @public
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
     * @public
     * @param txId
     * @return {Promise}
     */
    pollStatusAndFetchTransaction(txId) {
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                this.getStatus(txId)
                    .then((res) => {
                        if (res.status === 'valid') {
                            clearInterval(timer)
                            this.getTransaction(txId)
                                .then((res_) => {
                                    resolve(res_)
                                })
                        }
                    })
                    .catch((err) => {
                        clearInterval(timer)
                        reject(err)
                    })
            }, 500)
        })
    }

    /**
     * @public
     * @param transaction
     */
    postTransaction(transaction) {
        return this._req(this.getApiUrls('transactions'), {
            method: 'POST',
            jsonBody: transaction
        })
    }

    /**
     * @public
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
     * @public
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
