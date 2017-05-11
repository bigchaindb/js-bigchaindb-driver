import request from '../request';


export default function getApiUrls(API_PATH) {
    return {
        'blocks': API_PATH + 'blocks',
        'blocks_detail': API_PATH + 'blocks/%(blockId)s',
        'outputs': API_PATH + 'outputs',
        'statuses': API_PATH + 'statuses',
        'transactions': API_PATH + 'transactions',
        'transactions_detail': API_PATH + 'transactions/%(txId)s',
        'votes': API_PATH + 'votes'
    };
}

/**
 * @public
 * @param blockId
 * @param API_PATH
 */
export default function getBlock(blockId, API_PATH) {
    return request(getApiUrls(API_PATH)['blocks_detail'], {
            urlTemplateSpec: {
                blockId
            }
        });
}

/**
 * @public
 * @param tx_id
 * @param API_PATH
 */
export default function getStatus(tx_id, API_PATH) {
    return request(getApiUrls(API_PATH)['statuses'], {
            query: {
                tx_id
            }
        });
}

/**
 * @public
 * @param txId
 * @param API_PATH
 */
export default function getTransaction(txId, API_PATH) {
    return request(getApiUrls(API_PATH)['transactions_detail'], {
            urlTemplateSpec: {
                txId
            }
        });
}

/**
 * @public
 * @param tx_id
 * @param status
 * @param API_PATH
 */
export default function listBlocks({tx_id, status}, API_PATH) {
    return request(getApiUrls(API_PATH)['blocks'], {
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
 * @param API_PATH
 * @param onlyJsonResponse
 */
export default function listOutputs({ public_key, unspent }, API_PATH, onlyJsonResponse=true) {
    return request(getApiUrls(API_PATH)['outputs'], {
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
 * @param API_PATH
 */
export default function listTransactions({ asset_id, operation }, API_PATH) {
    return request(getApiUrls(API_PATH)['transactions'], {
        query: {
            asset_id,
            operation
        }
    })
}

/**
 * @public
 * @param block_id
 * @param API_PATH
 */
export default function listVotes(block_id, API_PATH) {
    return request(getApiUrls(API_PATH)['votes'], {
            query: {
                block_id
            }
        });
}

/**
 * @public
 * @param tx_id
 * @param API_PATH
 * @return {Promise}
 */
export default function (tx_id, API_PATH) {
    return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
            getStatus(tx_id, API_PATH)
                .then((res) => {
                    console.log('Fetched transaction status:', res);
                    if (res.status === 'valid') {
                        clearInterval(timer);
                        getTransaction(tx_id, API_PATH)
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
 * @param API_PATH
 */
export default function postTransaction(transaction, API_PATH) {
    return request(getApiUrls(API_PATH)['transactions'], {
        method: 'POST',
        jsonBody: transaction
    })
}
