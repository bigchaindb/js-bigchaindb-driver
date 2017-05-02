import getApiUrls from './getApiUrls';
import request from '../request';

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