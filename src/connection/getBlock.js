import getApiUrls from './getApiUrls';
import request from '../request';

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


