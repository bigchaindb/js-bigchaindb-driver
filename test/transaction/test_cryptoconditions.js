import test from 'ava'
import cc from 'crypto-conditions'
import { Ed25519Keypair, Transaction } from '../../src'


test('Ed25519 condition encoding', t => {
    const publicKey = '4zvwRjXUKGfvwnParsHAS3HuSVzV5cA4McphgmoCtajS'
    const target = {
        details: {
            type: 'ed25519-sha-256',
            public_key: publicKey,
        },
        uri: 'ni:///sha-256;uLdVX7FEjLWVDkAkfMAkEqPPwFqZj7qfiGE152t_x5c?fpt=ed25519-sha-256&cost=131072'
    }
    t.deepEqual(target, Transaction.makeEd25519Condition(publicKey))
})


test('Threshold condition encoding', t => {
    const publicKey = '4zvwRjXUKGfvwnParsHAS3HuSVzV5cA4McphgmoCtajS'
    const ed25519 = Transaction.makeEd25519Condition(publicKey, false)
    const condition = Transaction.makeThresholdCondition(
        1, [ed25519, ed25519])
    const output = Transaction.makeOutput(condition)
    const target = {
        condition: {
            details: {
                type: 'threshold-sha-256',
                threshold: 1,
                subconditions: [
                    {
                        type: 'ed25519-sha-256',
                        public_key: publicKey,
                    },
                    {
                        type: 'ed25519-sha-256',
                        public_key: publicKey,
                    }
                ]
            },
            uri: 'ni:///sha-256;xTeBhQj7ae5Tym7cp83fwtkesQnhdwNwDEMIYwnf2g0?fpt=threshold-sha-256&cost=133120&subtypes=ed25519-sha-256',
        },
        amount: '1',
        public_keys: [publicKey]
    }
    t.deepEqual(target, output)
})


test('Fulfillment correctly formed', t => {
    const alice = new Ed25519Keypair()
    const txCreate = Transaction.makeCreateTransaction(
        {},
        {},
        [Transaction.makeOutput(Transaction.makeEd25519Condition(alice.publicKey))],
        alice.publicKey
    )
    const txTransfer = Transaction.makeTransferTransaction(
        [{ tx: txCreate, output_index: 0 }],
        [Transaction.makeOutput(Transaction.makeEd25519Condition(alice.publicKey))],
        {}
    )
    const msg = Transaction.serializeTransactionIntoCanonicalString(txTransfer)
    const txSigned = Transaction.signTransaction(txTransfer, alice.privateKey)
    t.truthy(cc.validateFulfillment(txSigned.inputs[0].fulfillment,
        txCreate.outputs[0].condition.uri,
        new Buffer(msg)))
})


test('CryptoConditions JSON load', t => {
    const cond = Transaction.ccJsonLoad({
        type: 'threshold-sha-256',
        threshold: 1,
        subconditions: [{
            type: 'ed25519-sha-256',
            public_key: 'a'
        },
        {
            hash: 'a'
        }],
    })
    t.truthy(cond.subconditions.length === 2)
})


test('CryptoConditions JSON load', t => {
    const cond = Transaction.ccJsonLoad({
        type: 'threshold-sha-256',
        threshold: 1,
        subconditions: [{
            type: 'ed25519-sha-256',
            public_key: 'a'
        },
        {
            hash: 'a'
        }],
    })
    t.truthy(cond.subconditions.length === 2)
})
