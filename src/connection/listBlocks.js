import getApiUrls from './getApiUrls';
import request from '../request';

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
