// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import test from 'ava'

import {
    Connection
} from '../../src'

test('Pick connection with earliest backoff time', async t => {
    const path1 = 'http://localhost:9984/api/v1/'
    const path2 = 'http://localhost:9984/api/wrong/'

    // Reverse order
    const conn = new Connection([path2, path1])
    // This will trigger the 'forwardRequest' so the correct connection will be taken
    await conn.searchAssets('example')

    const connection1 = conn.transport.connectionPool[1]

    t.deepEqual(conn.transport.pickConnection(), connection1)
})
