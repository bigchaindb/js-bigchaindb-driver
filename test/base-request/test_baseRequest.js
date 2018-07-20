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
