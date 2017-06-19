import test from 'ava'
import { Ed25519Keypair, Transaction, Connection } from '../../src'

import {
    alice,
    aliceCondition,
    aliceOutput,
    bob,
    bobOutput,
    assetMessage,
    metaDataMessage
} from '../constants'

const API_PATH = 'http://localhost:9984/api/v1/'


test('Keypair is created', t => {
    const keyPair = new Ed25519Keypair()

    t.truthy(keyPair.publicKey)
    t.truthy(keyPair.privateKey)
})


// TODO: The following tests are a bit messy currently, please do:
//
//  - tidy up dependency on `pollStatusAndFetchTransaction`
test('Valid CREATE transaction', t => {
    const conn = new Connection(API_PATH)

    const tx = Transaction.makeCreateTransaction(
        assetMessage,
        metaDataMessage,
        [aliceOutput],
        alice.publicKey
    )

    const txSigned = Transaction.signTransaction(tx, alice.privateKey)
    return conn.postTransaction(txSigned)
        .then(({ 'id': txId }) => conn.pollStatusAndFetchTransaction(txId))
        .then(resTx => t.truthy(resTx))
})


test('Valid TRANSFER transaction with single Ed25519 input', t => {
    const conn = new Connection(API_PATH)
    const createTx = Transaction.makeCreateTransaction(
        assetMessage,
        metaDataMessage,
        [aliceOutput],
        alice.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        alice.privateKey
    )

    return conn.postTransaction(createTxSigned)
        .then(({ 'id': txId }) => conn.pollStatusAndFetchTransaction(txId))
        .then(() => {
            const transferTx = Transaction.makeTransferTransaction(
                createTxSigned,
                metaDataMessage,
                [aliceOutput],
                0
            )
            const transferTxSigned = Transaction.signTransaction(
                transferTx,
                alice.privateKey
            )
            return conn.postTransaction(transferTxSigned)
                .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
                .then(resTx => t.truthy(resTx))
    })
})


test('Valid TRANSFER transaction with multiple Ed25519 inputs', t => {
    const conn = new Connection(API_PATH)
    const createTx = Transaction.makeCreateTransaction(
        assetMessage,
        metaDataMessage,
        [aliceOutput, bobOutput],
        alice.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        alice.privateKey
    )

    return conn.postTransaction(createTxSigned)
        .then(({ 'id': txId }) => conn.pollStatusAndFetchTransaction(txId))
        .then(() => {
            const transferTx = Transaction.makeTransferTransaction(
                createTxSigned,
                metaDataMessage,
                [Transaction.makeOutput(aliceCondition, '2')],
                0,
                1
            )
            const transferTxSigned = Transaction.signTransaction(
                transferTx,
                alice.privateKey,
                bob.privateKey
            )
            return conn.postTransaction(transferTxSigned)
                .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
                .then(resTx => t.truthy(resTx))
    })
})
