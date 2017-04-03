import getApiUrls from './getApiUrls';
import request from '../request';


export default function listTransactions({ asset_id, operation }, API_PATH) {
    return request(getApiUrls(API_PATH)['transactions'], {
        query: {
            asset_id,
            operation
        }
    })
}