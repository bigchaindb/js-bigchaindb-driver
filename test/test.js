import test from 'ava'
import cc from 'five-bells-condition'
import { Ed25519Keypair, Transaction, Connection } from '../src'

const API_PATH = 'http://localhost:9984/api/v1/'

test('Keypair is created', t => {
    const keyPair = new Ed25519Keypair()

    t.truthy(keyPair.publicKey)
    t.truthy(keyPair.privateKey)
})

test('Valid CREATE transaction is evaluated by BigchainDB', t => {
    const alice = new Ed25519Keypair()
    const asset = { name: 'Shmui', type: 'cat' }
    const metadata = { dayOfTheWeek: 'Caturday' }

    const tx = Transaction.makeCreateTransaction(
        asset,
        metadata,
        [Transaction.makeOutput(Transaction.makeEd25519Condition(alice.publicKey))],
        alice.publicKey
    )

    const txSigned = Transaction.signTransaction(tx, alice.privateKey)
    const conn = new Connection(API_PATH)
    return conn.postTransaction(txSigned)
        .then(resTx => t.truthy(resTx))
})


/*
 * CryptoConditions support tests
 */

test('Ed25519 condition encoding', t => {
    const publicKey = '4zvwRjXUKGfvwnParsHAS3HuSVzV5cA4McphgmoCtajS'
    const target = {
        details: {
            type: 'ed25519-sha-256',
            public_key: publicKey,
            signature: null,
        },
        uri: 'ni:///sha-256;uLdVX7FEjLWVDkAkfMAkEqPPwFqZj7qfiGE152t_x5c?fpt=ed25519-sha-256&cost=131072'
    }
    t.deepEqual(target, Transaction.makeEd25519Condition(publicKey))
})

test('Threshold condition encoding', t => {
    const publicKey = '4zvwRjXUKGfvwnParsHAS3HuSVzV5cA4McphgmoCtajS'
    const condition = Transaction.makeThresholdCondition(
            1, [Transaction.makeEd25519Condition(publicKey, false)])
    const target = {
        details: {
            type: 'threshold-sha-256',
            threshold: 1,
            subfulfillments: [{
                type: 'ed25519-sha-256',
                public_key: publicKey,
                signature: null,
            }]
        },
        uri: 'ni:///sha-256;VBIfZSoBprUQy-LVNAzaZ2q-eyWbrcPKtBg1PuNXIpQ?fpt=threshold-sha-256&cost=132096&subtypes=ed25519-sha-256'
    }
    t.deepEqual(target, condition)
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
        txCreate,
        {},
        [Transaction.makeOutput(Transaction.makeEd25519Condition(alice.publicKey))],
        [0]
    )
    const msg = Transaction.serializeTransactionIntoCanonicalString(txTransfer)
    const txSigned = Transaction.signTransaction(txTransfer, alice.privateKey)
    t.truthy(cc.validateFulfillment(txSigned.inputs[0].fulfillment,
                                    txCreate.outputs[0].condition.uri,
                                    new Buffer(msg)))
})
