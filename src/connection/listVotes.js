import getApiUrls from './getApiUrls';
import request from '../request';

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

