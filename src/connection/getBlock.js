import getApiUrls from './getApiUrls';
import request from '../request';


export default function getBlock(blockId, API_PATH) {
    return request(getApiUrls(API_PATH)['blocks_detail'], {
            urlTemplateSpec: {
                blockId
            }
        });
}


