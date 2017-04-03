export default function getApiUrls(API_PATH) {
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