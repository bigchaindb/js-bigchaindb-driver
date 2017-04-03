import getApiUrls from './getApiUrls';
import request from '../request';


export default function listBlocks({tx_id, status}, API_PATH) {
    return request(getApiUrls(API_PATH)['blocks'], {
            query: {
                tx_id,
                status
            }
        });
}
