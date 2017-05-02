import getApiUrls from './getApiUrls';
import request from '../request';

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