// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import test from 'ava'
import formatText from '../../src/format_text'

test('formatText test type 1', t => {
    const expected = 'Hi there Dimi!'
    const actual = formatText('Hi there ${dimi}!', { dimi: 'Dimi' }) // eslint-disable-line no-template-curly-in-string

    t.is(actual, expected)
})

test('formatText test type 2', t => {
    const expected = 'BigchainDB is big'
    const actual = formatText('${database} is %(status)s', { // eslint-disable-line no-template-curly-in-string
        database: 'BigchainDB',
        status: 'big'
    })

    t.is(actual, expected)
})

test('formatText test type 3', t => {
    const expected = 'Berlin is best known for its Currywurst'
    const actual = formatText(
        'Berlin is best known for its ${berlin.topKnownFor[0].name}', // eslint-disable-line no-template-curly-in-string
        {
            berlin: {
                topKnownFor: [
                    {
                        name: 'Currywurst'
                    }
                ]
            }
        }
    )

    t.is(actual, expected)
})

test('formatText test throws', t => {
    const error = t.throws(() => {
        formatText(
            'This will give ${error.}', // eslint-disable-line no-template-curly-in-string
            { error: [{}] }
        )
    }, SyntaxError)

    t.is(error.message, '[formatText] failed to parse named argument key: error.')
})
