import request from './request';
import ApiUrls from '../constants/api_urls';


export function requestTransaction(txId) {
    return request(ApiUrls['transactions_detail'], {
            urlTemplateSpec: {
                txId
            }
        });
}

export function postTransaction(transaction) {
    return request(ApiUrls['transactions'], {
        method: 'POST',
        jsonBody: transaction
    })
}

export function listTransactions({ asset_id, operation }) {
    return request(ApiUrls['transactions'], {
        query: {
            asset_id,
            operation
        }
    })
}

export function pollStatusAndFetchTransaction(transaction) {
    return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
            requestStatus(transaction.id)
                .then((res) => {
                    console.log('Fetched transaction status:', res);
                    if (res.status === 'valid') {
                        clearInterval(timer);
                        requestTransaction(transaction.id)
                            .then((res) => {
                                console.log('Fetched transaction:', res);
                                resolve();
                            });
                    }
                });
        }, 500)
    })
}

export function listOutputs({ public_key, unspent }) {
    return request(ApiUrls['outputs'], {
        query: {
            public_key,
            unspent
        }
    })
}

export function requestStatus(tx_id) {
    return request(ApiUrls['statuses'], {
            query: {
                tx_id
            }
        });
}
