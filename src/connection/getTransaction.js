import getApiUrls from './getApiUrls';
import request from '../request';


export default function getTransaction(txId, API_PATH) {
    return request(getApiUrls(API_PATH)['transactions_detail'], {
            urlTemplateSpec: {
                txId
            }
        });
}
