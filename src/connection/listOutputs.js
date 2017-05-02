import getApiUrls from './getApiUrls';
import request from '../request';

/**
 * @public
 * @param public_key
 * @param unspent
 * @param API_PATH
 * @param onlyJsonResponse
 */
export default function listOutputs({ public_key, unspent }, API_PATH, onlyJsonResponse=true) {
    return request(getApiUrls(API_PATH)['outputs'], {
        query: {
            public_key,
            unspent
        }
    }, onlyJsonResponse)
}