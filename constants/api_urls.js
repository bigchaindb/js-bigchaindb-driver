/* eslint-disable prefer-template */
import { API_PATH } from './application_constants';


const ApiUrls = {
    'transactions': API_PATH + 'transactions',
    'transactions_detail': API_PATH + 'transactions/%(txId)s',
    'outputs': API_PATH + 'outputs',
    'statuses': API_PATH + 'statuses'
};


export default ApiUrls;
