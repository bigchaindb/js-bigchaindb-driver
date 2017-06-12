import request from '../request';


export default class Connection {
    constructor(path, headers) {
        this.path = path;
        this.headers = headers;
    }

    getApiUrls(endpoints) {
        // TODO: Use camel case
        return {
            'blocks': this.path + 'blocks',
            'blocks_detail': this.path + 'blocks/%(blockId)s',
            'outputs': this.path + 'outputs',
            'statuses': this.path + 'statuses',
            'transactions': this.path + 'transactions',
            'transactions_detail': this.path + 'transactions/%(txId)s',
            'search_assets': this.path + 'assets',
            'votes': this.path + 'votes'
        }[endpoints];
    }

    _req(path, options={}) {
        // NOTE: `options.headers` could be undefined, but that's OK.
        options.headers = Object.assign({}, options.headers, this.headers)
        return request(path, options)
    }

    /**
     * @public
     * @param blockId
     */
    getBlock(blockId) {
        return this._req(this.getApiUrls('blocks_detail'), {
                urlTemplateSpec: {
                    blockId
                }
            });
    }

    /**
     * @public
     * @param tx_id
     */
    getStatus(tx_id) {
        return this._req(this.getApiUrls('statuses'), {
                query: {
                    tx_id
                }
            });
    }

    /**
     * @public
     * @param txId
     */
    getTransaction(txId) {
        return this._req(this.getApiUrls('transactions_detail'), {
                urlTemplateSpec: {
                    txId
                }
            });
    }

    /**
     * @public
     * @param tx_id
     * @param status
     */
    listBlocks({ tx_id, status }) {
        return this._req(this.getApiUrls('blocks'), {
                query: {
                    tx_id,
                    status
                }
            });
    }

    /**
     * @public
     * @param public_key
     * @param unspent
     * @param onlyJsonResponse
     */
    listOutputs({ public_key, unspent }, onlyJsonResponse=true) {
        return this._req(this.getApiUrls('outputs'), {
            query: {
                public_key,
                unspent
            }
        }, onlyJsonResponse)
    }

    /**
     * @public
     * @param asset_id
     * @param operation
     */
    listTransactions({ asset_id, operation }) {
        return this._req(this.getApiUrls('transactions'), {
            query: {
                asset_id,
                operation
            }
        })
    }

    /**
     * @public
     * @param block_id
     */
    listVotes(block_id) {
        return this._req(this.getApiUrls('votes'), {
                query: {
                    block_id
                }
            });
    }

    /**
     * @public
     * @param tx_id
     * @return {Promise}
     */
    pollStatusAndFetchTransaction(tx_id) {
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                this.getStatus(tx_id)
                    .then((res) => {
                        console.log('Fetched transaction status:', res);
                        if (res.status === 'valid') {
                            clearInterval(timer);
                            this.getTransaction(tx_id)
                                .then((res) => {
                                    console.log('Fetched transaction:', res);
                                    resolve(res);
                                });
                        }
                    })
                    .catch((err) => {
                        clearInterval(timer);
                        reject(err);
                    });
            }, 500)
        })
    }

    /**
     * @public
     *
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
     *
     * @param transaction
     */
    searchAssets(query) {
        return this.req(this.getApiUrls('search_assets'), {
            query: {
                text_search: query
            }
        })
    }
}
