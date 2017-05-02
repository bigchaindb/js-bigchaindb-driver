import getApiUrls from './getApiUrls';
import request from '../request';

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
