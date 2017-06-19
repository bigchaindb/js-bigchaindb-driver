import test from 'ava'
import sinon from 'sinon'
import { Connection } from '../../src'

const API_PATH = 'http://localhost:9984/api/v1/'
const conn = new Connection(API_PATH)


test('generate API URLS', t => {
    const endpoints = {
        'blocks': 'blocks',
        'blocksDetail': 'blocks/%(blockId)s',
        'outputs': 'outputs',
        'statuses': 'statuses',
        'transactions': 'transactions',
        'transactionsDetail': 'transactions/%(transactionId)s',
        'searchAssets': 'assets',
    }
    Object.keys(endpoints).forEach((endpointName) => {
        const url = conn.getApiUrls(endpointName)
        const expected = API_PATH + endpoints[endpointName]
        t.is(url, expected)
    })
})


test('Get block for a block id', t => {
    const expectedPath = 'path'
    const blockId = 'abc'

    conn._req = sinon.spy()
    conn.getApiUrls = sinon.stub().returns(expectedPath)

    conn.getBlock(blockId)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { urlTemplateSpec: { blockId } }
    ))
})


test('Get status for a transaction', t => {
    const expectedPath = 'path'
    const transactionId = 'abc'

    conn._req = sinon.spy()
    conn.getApiUrls = sinon.stub().returns(expectedPath)

    conn.getStatus(transactionId)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { query: { transaction_id: transactionId } }
    ))
})


test('Get transaction for a transaction id', t => {
    const expectedPath = 'path'
    const transactionId = 'abc'

    conn._req = sinon.spy()
    conn.getApiUrls = sinon.stub().returns(expectedPath)

    conn.getTransaction(transactionId)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { urlTemplateSpec: { transactionId } }
    ))
})


test('Get list of blocks for a transaction id', t => {
    const expectedPath = 'path'
    const transactionId = 'abc'
    const status = 'status'

    conn._req = sinon.spy()
    conn.getApiUrls = sinon.stub().returns(expectedPath)

    conn.listBlocks({ transactionId, status })
    t.truthy(conn._req.calledWith(
        expectedPath,
        {
            query: {
                transaction_id: transactionId,
                status
            }
        }
    ))
})


test('Get votes for a block id', t => {
    const expectedPath = 'path'
    const blockId = 'abc'

    conn._req = sinon.spy()
    conn.getApiUrls = sinon.stub().returns(expectedPath)

    conn.listVotes(blockId)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { query: { block_id: blockId } }
    ))
})


test('Get asset for a text', t => {
    const expectedPath = 'path'
    const query = 'abc'

    conn._req = sinon.spy()
    conn.getApiUrls = sinon.stub().returns(expectedPath)

    conn.searchAssets(query)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { query: { text_search: query } }
    ))
})
