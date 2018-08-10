// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import test from 'ava'
import baseRequest from '../../src/baseRequest'

test('baseRequest test query and vsprint', async t => {
    const target = {
        message: 'HTTP Error: Requested page not reachable',
        requestURI: 'https://www.google.com/teapot',
        status: '418 I\'m a Teapot',
    }
    const error = await t.throws(baseRequest('https://%s.com/', {
        urlTemplateSpec: ['google'],
        query: 'teapot'
    }))
    t.deepEqual(target, error)
})
