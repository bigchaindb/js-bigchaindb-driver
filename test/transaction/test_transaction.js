import test from 'ava'
import { Transaction } from '../../src'


test('Create valid output with default amount', t => {
    const condition = {
        details: {
            public_key: 'abc'
        }
    }
    const expected = {
        amount: '1',
        condition,
        public_keys: ['abc']
    }
    const res = Transaction.makeOutput(condition)
    return t.deepEqual(res, expected)
})


test('Create valid output with custom amount', t => {
    const condition = {
        details: {
            public_key: 'abc'
        }
    }
    const customAmount = '1337'
    const expected = {
        amount: customAmount,
        condition,
        public_keys: ['abc']
    }
    const res = Transaction.makeOutput(condition, customAmount)
    return t.deepEqual(res, expected)
})

test('Pass condition not based on public_keys to makeOutput', t => {
    const condition = {
        details: {
            idea: 'just pretend this is e.g. a hashlock'
        }
    }
    const expected = {
        amount: '1',
        condition,
        public_keys: []
    }
    const res = Transaction.makeOutput(condition)
    return t.deepEqual(res, expected)
})


test('makeOutput throws TypeError with incorrect amount type', t => {
    t.throws(() => Transaction.makeOutput({}, 1337), TypeError)
})
