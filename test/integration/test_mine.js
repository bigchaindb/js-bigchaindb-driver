import test from 'ava'
import { Transaction, Connection } from '../../src'

import {
    API_PATH,
    alice,
    aliceOutput,
    asset,
    metaData
} from '../constants'


test('Search transaction containing an asset', t => {
    const conn = new Connection(API_PATH)

    console.log('posting')
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
    console.log('the payload is ', JSON.stringify(createTxSigned), { showHidden: false, depth: null })

    return conn.postTransactionCommit(createTxSigned)
        .then(({ id }) => conn.listTransactions(id))
        .then(transactions => {
            console.log('cccccccccccc', transactions, createTxSigned.id)
            t.truthy(transactions.length === 1)
        })
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

    return conn.postTransactionSync(createTxSigned)
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
            return conn.postTransactionSync(transferTxSigned)
                .then(resTx => t.truthy(resTx))
        })
})
