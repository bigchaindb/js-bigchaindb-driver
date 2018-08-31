// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import test from 'ava'
import Connection from '../../src/connection'


const conn = new Connection()

test('Ensure that BackoffTimedelta works properly', t => {
    const req = conn.transport.pickConnection()
    req.backoffTime = Date.now() + 50
    const target = req.getBackoffTimedelta()
    // The value should be close to 50
    t.is(target > 45, true)
})

test('Ensure that updateBackoffTime throws and error on TimeoutError', async t => {
    const req = conn.transport.pickConnection()
    const target = {
        message: 'TimeoutError'
    }
    req.connectionError = target

    const error = t.throws(() => {
        req.updateBackoffTime()
    })

    t.deepEqual(target, error)
})
