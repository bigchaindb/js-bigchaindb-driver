'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = getApiUrls;
function getApiUrls(API_PATH) {
    return {
        'blocks': API_PATH + 'blocks',
        'blocks_detail': API_PATH + 'blocks/%(blockId)s',
        'outputs': API_PATH + 'outputs',
        'statuses': API_PATH + 'statuses',
        'transactions': API_PATH + 'transactions',
        'transactions_detail': API_PATH + 'transactions/%(txId)s',
        'votes': API_PATH + 'votes'
    };
}
module.exports = exports['default'];