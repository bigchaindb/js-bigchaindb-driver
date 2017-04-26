import getApiUrls from './getApiUrls';
import request from '../request';


export default function postTransaction(transaction, API_PATH) {
    return request(getApiUrls(API_PATH)['transactions'], {
        method: 'POST',
        jsonBody: transaction
    })
}

