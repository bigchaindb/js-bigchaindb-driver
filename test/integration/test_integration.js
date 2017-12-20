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
                [{ tx: createTxSigned, output_index: 0 }],
                [aliceOutput],
                metaData
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
                [{ tx: createTxSigned, output_index: 0 }, { tx: createTxSigned, output_index: 1 }],
                [Transaction.makeOutput(aliceCondition, '2')],
                metaData
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


test('Valid TRANSFER transaction with multiple Ed25519 inputs from different transactions', t => {
    const conn = new Connection(API_PATH)
    const carol = new Ed25519Keypair()
    const carolCondition = Transaction.makeEd25519Condition(carol.publicKey)
    const carolOutput = Transaction.makeOutput(carolCondition)
    const trent = new Ed25519Keypair()
    const trentCondition = Transaction.makeEd25519Condition(trent.publicKey)
    const trentOutput = Transaction.makeOutput(trentCondition)
    const eli = new Ed25519Keypair()
    const eliCondition = Transaction.makeEd25519Condition(eli.publicKey)

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
            const transferTx1 = Transaction.makeTransferTransaction(
                [{ tx: createTxSigned, output_index: 0 }],
                [carolOutput],
                metaData
            )
            const transferTxSigned1 = Transaction.signTransaction(
                transferTx1,
                alice.privateKey
            )
            const transferTx2 = Transaction.makeTransferTransaction(
                [{ tx: createTxSigned, output_index: 1 }],
                [trentOutput],
                metaData
            )
            const transferTxSigned2 = Transaction.signTransaction(
                transferTx2,
                bob.privateKey
            )

            return conn.postTransaction(transferTxSigned1)
                .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
                .then(conn.postTransaction(transferTxSigned2))
                .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
                .then(() => {
                    const transferTxMultipleInputs = Transaction.makeTransferTransaction(
                        [{ tx: transferTxSigned1, output_index: 0 },
                            { tx: transferTxSigned2, output_index: 0 }],
                        [Transaction.makeOutput(eliCondition, '2')],
                        metaData
                    )
                    const transferTxSignedMultipleInputs = Transaction.signTransaction(
                        transferTxMultipleInputs,
                        carol.privateKey,
                        trent.privateKey
                    )
                    return conn.postTransaction(transferTxSignedMultipleInputs)
                        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
                        .then(resTx => t.truthy(resTx))
                })
        })
})


test('Search for spent and unspent outputs of a given public key', t => {
    const conn = new Connection(API_PATH)
    const carol = new Ed25519Keypair()
    const carolCondition = Transaction.makeEd25519Condition(carol.publicKey)
    const carolOutput = Transaction.makeOutput(carolCondition)
    const trent = new Ed25519Keypair()
    const trentCondition = Transaction.makeEd25519Condition(trent.publicKey)
    const trentOutput = Transaction.makeOutput(trentCondition)


    const createTx = Transaction.makeCreateTransaction(
        asset(),
        metaData,
        [carolOutput, carolOutput],
        carol.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        carol.privateKey,
        carol.privateKey
    )

    // We spent output 1 (of 0, 1)
    const transferTx = Transaction.makeTransferTransaction(
        [{ tx: createTxSigned, output_index: 1 }],
        [trentOutput],
        metaData
    )
    const transferTxSigned = Transaction.signTransaction(
        transferTx,
        carol.privateKey,
    )

    return conn.postTransaction(createTxSigned)
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => conn.postTransaction(transferTxSigned))
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => conn.listOutputs(carol.publicKey))
        // now listOutputs should return us outputs 0 and 1 (unfiltered)
        .then(outputs => t.truthy(outputs.length === 2))
})


test('Search for unspent outputs for a given public key', t => {
    const conn = new Connection(API_PATH)
    const carol = new Ed25519Keypair()
    const carolCondition = Transaction.makeEd25519Condition(carol.publicKey)
    const carolOutput = Transaction.makeOutput(carolCondition)
    const trent = new Ed25519Keypair()
    const trentCondition = Transaction.makeEd25519Condition(trent.publicKey)
    const trentOutput = Transaction.makeOutput(trentCondition)

    const createTx = Transaction.makeCreateTransaction(
        asset(),
        metaData,
        [carolOutput, carolOutput, carolOutput],
        carol.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        carol.privateKey,
        carol.privateKey
    )

    // We spent output 1 (of 0, 1, 2)
    const transferTx = Transaction.makeTransferTransaction(
        [{ tx: createTxSigned, output_index: 1 }],
        [trentOutput],
        metaData
    )
    const transferTxSigned = Transaction.signTransaction(
        transferTx,
        carol.privateKey,
    )

    return conn.postTransaction(createTxSigned)
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => conn.postTransaction(transferTxSigned))
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        // now listOutputs should return us outputs 0 and 2 (1 is spent)
        .then(() => conn.listOutputs(carol.publicKey, 'false'))
        .then(outputs => t.truthy(outputs.length === 2))
})


test('Search for spent outputs for a given public key', t => {
    const conn = new Connection(API_PATH)
    const carol = new Ed25519Keypair()
    const carolCondition = Transaction.makeEd25519Condition(carol.publicKey)
    const carolOutput = Transaction.makeOutput(carolCondition)
    const trent = new Ed25519Keypair()
    const trentCondition = Transaction.makeEd25519Condition(trent.publicKey)
    const trentOutput = Transaction.makeOutput(trentCondition)

    const createTx = Transaction.makeCreateTransaction(
        asset(),
        metaData,
        [carolOutput, carolOutput, carolOutput],
        carol.publicKey
    )
    const createTxSigned = Transaction.signTransaction(
        createTx,
        carol.privateKey,
        carol.privateKey
    )

    // We spent output 1 (of 0, 1, 2)
    const transferTx = Transaction.makeTransferTransaction(
        [{ tx: createTxSigned, output_index: 1 }],
        [trentOutput],
        metaData
    )
    const transferTxSigned = Transaction.signTransaction(
        transferTx,
        carol.privateKey,
    )

    return conn.postTransaction(createTxSigned)
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        .then(() => conn.postTransaction(transferTxSigned))
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id))
        // now listOutputs should only return us output 1 (0 and 2 are unspent)
        .then(() => conn.listOutputs(carol.publicKey, true))
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


test('Search for metadata', t => {
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
        .then(() => conn.searchMetadata(createTxSigned.metadata.message))
        .then(assets => t.truthy(
            assets.pop(),
            createTxSigned.metadata.message
        ))
})

test('Search blocks containing a transaction', t => {
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
        .then(({ id }) => conn.listBlocks(id, 'VALID'))
        .then(blocks => conn.getBlock(blocks.pop()))
        .then(({ block: { transactions } }) => transactions.filter(
            ({ id }) => id === createTxSigned.id
        ))
        .then(transactions => t.truthy(transactions.length === 1))
})


test('Search transaction containing an asset', t => {
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
        .then(({ id }) => conn.pollStatusAndFetchTransaction(id, 'CREATE'))
        .then(({ id }) => conn.listTransactions(id))
        .then(transactions => t.truthy(transactions.length === 1))
})


test('Content-Type cannot be set', t => {
    t.throws(() => new Connection(API_PATH, { 'Content-Type': 'application/json' }), Error)
})
