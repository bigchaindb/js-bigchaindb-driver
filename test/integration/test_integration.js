import test from 'ava'
import { Ed25519Keypair, Transaction, Connection } from '../../src'

import {
    alice,
    aliceCondition,
    aliceOutput,
    bob,
    bobOutput,
    asset,
    metaData
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
        asset(),
        metaData,
        [aliceOutput],
        alice.publicKey
    )
    const txSigned = Transaction.signTransaction(tx, alice.privateKey)

    return conn.postTransaction(txSigned)
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(resTx => t.truthy(resTx))
})


test('Valid TRANSFER transaction with single Ed25519 input', t => {
    const conn = new Connection(API_PATH)
    const createTx = Transaction.makeCreateTransaction(
        asset(),
        metaData,
        [aliceOutput],
        alice.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        alice.privateKey
    )

    return conn.postTransaction(createTxSigned)
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => {
            const transferTx = Transaction.makeTransferTransaction(
                createTxSigned,
                metaData,
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
        asset(),
        metaData,
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
                metaData,
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


test('Search for spent and unspent outputs of a given public key', t => {
    const conn = new Connection(API_PATH)

    const createTx = Transaction.makeCreateTransaction(
        asset(),
        metaData,
        [aliceOutput, aliceOutput],
        alice.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        alice.privateKey,
        alice.privateKey
    )

    // We spent output 1 (of 0, 1)
    const transferTx = Transaction.makeTransferTransaction(
        createTxSigned,
        metaData,
        [bobOutput],
        1
    )
    const transferTxSigned = Transaction.signTransaction(
        transferTx,
        alice.privateKey,
    )

    function byTransactionId(transactionId, ...outputIndices) {
        return value => transactionId === value.transaction_id &&
            outputIndices.includes(value.output)
    }

    return conn.postTransaction(createTxSigned)
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => conn.postTransaction(transferTxSigned))
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => conn.listOutputs(alice.publicKey))
        // now listOutputs should return us outputs 0 and 1 (unfiltered)
        .then(outputs => outputs.filter(byTransactionId(
            createTxSigned.id,
            0,
            1
        )))
        .then(outputs => t.truthy(outputs.length === 2))
})


test('Search for unspent outputs for a given public key', t => {
    const conn = new Connection(API_PATH)

    const createTx = Transaction.makeCreateTransaction(
        asset(),
        metaData,
        [aliceOutput, aliceOutput, aliceOutput],
        alice.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        alice.privateKey,
        alice.privateKey
    )

    // We spent output 1 (of 0, 1, 2)
    const transferTx = Transaction.makeTransferTransaction(
        createTxSigned,
        metaData,
        [bobOutput],
        1
    )
    const transferTxSigned = Transaction.signTransaction(
        transferTx,
        alice.privateKey,
    )

    function byTransactionId(transactionId, ...outputIndices) {
        return value => transactionId === value.transaction_id &&
            outputIndices.includes(value.output)
    }

    return conn.postTransaction(createTxSigned)
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => conn.postTransaction(transferTxSigned))
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        // now listOutputs should return us outputs 0 and 2 (1 is spent)
        .then(() => conn.listOutputs(alice.publicKey, false))
        .then(outputs => outputs.filter(byTransactionId(
            createTxSigned.id,
            0,
            2
        )))
        .then(outputs => t.truthy(outputs.length === 2))
})


test('Search for spent outputs for a given public key', t => {
    const conn = new Connection(API_PATH)

    const createTx = Transaction.makeCreateTransaction(
        asset(),
        metaData,
        [aliceOutput, aliceOutput, aliceOutput],
        alice.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        alice.privateKey,
        alice.privateKey
    )

    // We spent output 1 (of 0, 1, 2)
    const transferTx = Transaction.makeTransferTransaction(
        createTxSigned,
        metaData,
        [bobOutput],
        1
    )
    const transferTxSigned = Transaction.signTransaction(
        transferTx,
        alice.privateKey,
    )

    function byTransactionId(transactionId, ...outputIndices) {
        return value => transactionId === value.transaction_id &&
            outputIndices.includes(value.output)
    }

    return conn.postTransaction(createTxSigned)
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => conn.postTransaction(transferTxSigned))
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        // now listOutputs should only return us output 1 (0 and 2 are unspent)
        .then(() => conn.listOutputs(alice.publicKey, true))
        .then(outputs => outputs.filter(byTransactionId(createTxSigned.id, 1)))
        .then(outputs => t.truthy(outputs.length === 1))
})


test('Search for an asset', t => {
    const conn = new Connection(API_PATH)

    const createTx = Transaction.makeCreateTransaction(
        asset(),
        metaData,
        [aliceOutput],
        alice.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        alice.privateKey
    )

    return conn.postTransaction(createTxSigned)
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => conn.searchAssets(createTxSigned.asset.data.message))
        .then(assets => t.truthy(
            assets.pop(),
            createTxSigned.asset.data.message
        ))
})
