// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import test from 'ava'
import sinon from 'sinon'

import {
    Connection
} from '../../src'
import {
    API_PATH
} from '../constants'

const conn = new Connection(API_PATH)

test('Payload thrown at incorrect API_PATH', async t => {
    const path = 'http://localhost:9984/api/wrong/'
    const connection = new Connection(path)
    const target = {
        message: 'HTTP Error: Requested page not reachable',
        status: '404 NOT FOUND',
        requestURI: 'http://localhost:9984/api/wrong/transactions/transactionId'
    }
    const error = await t.throwsAsync(connection.getTransaction('transactionId'), {
        instanceOf: Error, message: target.message
    })

    t.is('ResponseError', error.name)
    t.is(target.status, error.status)
    t.is(target.requestURI, error.requestURI)
})

test('Generate API URLS', t => {
    const endpoints = {
        'blocks': 'blocks',
        'blocksDetail': 'blocks/%(blockHeight)s',
        'outputs': 'outputs',
        'transactions': 'transactions',
        'transactionsSync': 'transactions?mode=sync',
        'transactionsAsync': 'transactions?mode=async',
        'transactionsCommit': 'transactions?mode=commit',
        'transactionsDetail': 'transactions/%(transactionId)s',
        'assets': 'assets',
    }
    Object.keys(endpoints).forEach(endpointName => {
        const url = Connection.getApiUrls(endpointName)
        const expected = endpoints[endpointName]
        t.is(url, expected)
    })
})

test('Normalize node from an object', t => {
    const headers = {
        custom: 'headers'
    }
    const node = {
        endpoint: API_PATH,
        headers: {
            hello: 'world'
        }
    }
    const expectedNode = {
        'endpoint': API_PATH,
        'headers': {
            hello: 'world',
            custom: 'headers'
        }
    }

    t.deepEqual(Connection.normalizeNode(node, headers), expectedNode)
})

test('Normalize node from a string', t => {
    const headers = {
        custom: 'headers'
    }
    const expectedNode = {
        'endpoint': API_PATH,
        'headers': {
            custom: 'headers'
        }
    }

    t.deepEqual(Connection.normalizeNode(API_PATH, headers), expectedNode)
})

test('Request with custom headers', t => {
    const testConn = new Connection(API_PATH, {
        hello: 'world'
    })
    const expectedOptions = {
        headers: {
            custom: 'headers'
        }
    }
    const PATH = 'blocks'
    testConn.transport.forwardRequest = sinon.spy()

    testConn._req(PATH, {
        headers: {
            custom: 'headers'
        }
    })
    t.truthy(testConn.transport.forwardRequest.calledWith(PATH, expectedOptions))
})

test('Get block for a block id', t => {
    const expectedPath = 'path'
    const blockHeight = 'abc'

    conn._req = sinon.spy()
    Connection.getApiUrls = sinon.stub().returns(expectedPath)

    conn.getBlock(blockHeight)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { urlTemplateSpec: { blockHeight } }
    ))
})

test('Get transaction for a transaction id', t => {
    const expectedPath = 'path'
    const transactionId = 'abc'

    conn._req = sinon.spy()
    Connection.getApiUrls = sinon.stub().returns(expectedPath)

    conn.getTransaction(transactionId)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { urlTemplateSpec: { transactionId } }
    ))
})

test('Get list of blocks for a transaction id', t => {
    const expectedPath = 'path'
    const transactionId = 'abc'

    conn._req = sinon.spy()
    Connection.getApiUrls = sinon.stub().returns(expectedPath)

    conn.listBlocks(transactionId)
    t.truthy(conn._req.calledWith(
        expectedPath,
        {
            query: {
                transaction_id: transactionId,
            }
        }
    ))
})

test('Get list of transactions for an asset id', t => {
    const expectedPath = 'path'
    const assetId = 'abc'
    const operation = 'operation'

    conn._req = sinon.spy()
    Connection.getApiUrls = sinon.stub().returns(expectedPath)

    conn.listTransactions(assetId, operation)
    t.truthy(conn._req.calledWith(
        expectedPath,
        {
            query: {
                asset_id: assetId,
                operation
            }
        }
    ))
})

test('Get outputs for a public key and no spent flag', t => {
    const expectedPath = 'path'
    const publicKey = 'publicKey'

    conn._req = sinon.spy()
    Connection.getApiUrls = sinon.stub().returns(expectedPath)

    conn.listOutputs(publicKey)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { query: { public_key: publicKey } }
    ))
})

test('Get outputs for a public key and spent=false', t => {
    const expectedPath = 'path'
    const publicKey = 'publicKey'
    const spent = false

    conn._req = sinon.spy()
    Connection.getApiUrls = sinon.stub().returns(expectedPath)

    conn.listOutputs(publicKey, spent)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { query: { public_key: publicKey, spent: 'false' } }
    ))
})

test('Get outputs for a public key and spent=true', t => {
    const expectedPath = 'path'
    const publicKey = 'publicKey'
    const spent = true

    conn._req = sinon.spy()
    Connection.getApiUrls = sinon.stub().returns(expectedPath)

    conn.listOutputs(publicKey, spent)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { query: { public_key: publicKey, spent: 'true' } }
    ))
})

test('Get asset for text', t => {
    const expectedPath = 'path'
    const search = 'abc'

    conn._req = sinon.spy()
    Connection.getApiUrls = sinon.stub().returns(expectedPath)

    conn.searchAssets(search)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { query: { search, limit: 10 } }
    ))
})

test('Get metadata for text', t => {
    const expectedPath = 'path'
    const search = 'abc'

    conn._req = sinon.spy()
    Connection.getApiUrls = sinon.stub().returns(expectedPath)

    conn.searchMetadata(search)
    t.truthy(conn._req.calledWith(
        expectedPath,
        { query: { search, limit: 10 } }
    ))
})
