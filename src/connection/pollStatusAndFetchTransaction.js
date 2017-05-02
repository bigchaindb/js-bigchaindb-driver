import getTransaction from './getTransaction';
import getStatus from './getStatus';

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
