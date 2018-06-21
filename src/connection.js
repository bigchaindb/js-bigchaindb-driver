import baseRequest from './baseRequest'
import sanitize from './sanitize'

const HEADER_BLACKLIST = ['content-type']
const DEFAULT_REQUEST_CONFIG = {
    headers: {
        'Accept': 'application/json'
    }
}
const delay = 200
/**
 * Base connection
 */
export default class Connection {
    constructor(path = [], headers = {}) {
        // E list of BigchainDB endpoints
        this.E = path.length
        // number of node
        this.iNode = 0
        this.nTries = []
        this.timestamps = []
        if (typeof path[0] === 'string') {
            this.path = path
            this.headers = Object.assign({}, headers)
            Object.keys(headers).forEach(header => {
                if (HEADER_BLACKLIST.includes(header.toLowerCase())) {
                    throw new Error(`Header ${header} is reserved and cannot be set.`)
                }
            })
        } else {
            path.forEach(singlePath => {
                this.path = []
                path.push(singlePath.endpoint)
                this.headers = []
                this.headers.push(Object.assign({}, headers))
                singlePath.headers.forEach(header => {
                    if (HEADER_BLACKLIST.includes(header.toLowerCase())) {
                        throw new Error(`Header ${header} is reserved and cannot be set.`)
                    }
                })
            })
        }
    }

    getApiUrls(endpoint) {
        return this.path[this.iNode] + {
            'blocks': 'blocks',
            'blocksDetail': 'blocks/%(blockHeight)s',
            'outputs': 'outputs',
            'transactions': 'transactions',
            'transactionsSync': 'transactions?mode=sync',
            'transactionsCommit': 'transactions?mode=commit',
            'transactionsDetail': 'transactions/%(transactionId)s',
            'assets': 'assets',
            'metadata': 'metadata',
            'votes': 'votes'
        }[endpoint]
    }

    request(url, config = {}) {
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
            .then(res => {
                res.json()
                this.nTries[this.iNode] = 0
            })
            .catch(err => {
                console.error(err)

                // Round-robin strategy
                // this.timestamps[this.iNode] = Date.now() + delay
                // if(Date.now()> this.timestamps[this.iNode]){
                this.nTries[this.iNode]++
                if (this.path[this.iNode + 1]) {
                    this.iNode++
                }else if (path.length > 1){
                    this.iNode = 0
                }
                if(this.nTries[this.iNode] < 3){
                    baseRequest(apiUrl,requestConfig)
                }
                throw err
            })
    }


    _req(path, options = {}) {
        // NOTE: `options.headers` could be undefined, but that's OK.
        options.headers = Object.assign({}, options.headers, this.headers[this.iNode])
        return this.request(path, options)
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
        return this._req(this.getApiUrls('transactions'), {
            method: 'POST',
            jsonBody: transaction
        })
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
