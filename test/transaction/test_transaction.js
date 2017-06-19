import test from 'ava'
import { Transaction, Ed25519Keypair } from '../../src'
import { _makeTransferTransaction } from '../../src/transaction/makeTransferTransaction'
import makeInputTemplate from '../../src/transaction/makeInputTemplate'


// TODO: Find out if ava has something like conftest, if so put this there.
const alice = new Ed25519Keypair()
const aliceCondition = Transaction.makeEd25519Condition(alice.publicKey)
const aliceOutput = Transaction.makeOutput(aliceCondition)
const assetMessage = { assetMessage: 'assetMessage' }
const metaDataMessage = { metaDataMessage: 'metaDataMessage' }
const createTx = Transaction.makeCreateTransaction(
    assetMessage,
    metaDataMessage,
    [aliceOutput],
    alice.publicKey
)
const transferTx = Transaction.makeTransferTransaction(
    createTx,
    metaDataMessage,
    [aliceOutput],
    0
)


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


test('Create TRANSFER transaction based on CREATE transaction', t => {
    const testTx = _makeTransferTransaction(
        createTx,
        metaDataMessage,
        [aliceOutput],
        0
    )
    const expected = [
        'TRANSFER',
        {id: createTx.id },
        metaDataMessage,
        [aliceOutput],
        [makeInputTemplate(
            [alice.publicKey],
            { output: 0, transaction_id: createTx.id }
        )]
    ]

    t.deepEqual(testTx, expected)
})


test('Create TRANSFER transaction based on TRANSFER transaction', t => {
    const testTx = _makeTransferTransaction(
        transferTx,
        metaDataMessage,
        [aliceOutput],
        0
    )
    const expected = [
        'TRANSFER',
        { id: transferTx.asset.id },
        metaDataMessage,
        [aliceOutput],
        [makeInputTemplate(
            [alice.publicKey],
            { output: 0, transaction_id: transferTx.id }
        )]
    ]

    t.deepEqual(testTx, expected)
})
