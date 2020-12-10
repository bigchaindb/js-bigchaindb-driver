// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import test from 'ava'
import base58 from 'bs58'
import { Ed25519Sha256 } from 'crypto-conditions'
import { Transaction, Ed25519Keypair } from '../src'
// TODO: Find out if ava has something like conftest, if so put this there.

// NOTE: It's safer to cast `Math.random()` to a string, to avoid differences
// in "float interpretation" between languages (e.g. JavaScript and Python)
export const API_PATH = 'http://localhost:9984/api/v1/'
export function asset() { return { message: `${Math.random()}` } }
export const metaData = { message: 'metaDataMessage' }

export const alice = new Ed25519Keypair()
export const aliceCondition = Transaction.makeEd25519Condition(alice.publicKey)
export const aliceOutput = Transaction.makeOutput(aliceCondition)
export const createTx = Transaction.makeCreateTransaction(
    asset,
    metaData,
    [aliceOutput],
    alice.publicKey
)
export const transferTx = Transaction.makeTransferTransaction(
    [{ tx: createTx, output_index: 0 }],
    [aliceOutput],
    metaData
)

export const bob = new Ed25519Keypair()
export const bobCondition = Transaction.makeEd25519Condition(bob.publicKey)
export const bobOutput = Transaction.makeOutput(bobCondition)

export function delegatedSignTransaction(...keyPairs) {
    return function sign(transaction, input, transactionHash) {
        const filteredKeyPairs = keyPairs.filter(({ publicKey }) =>
            input.owners_before.includes(publicKey))
        const ed25519Fulfillment = new Ed25519Sha256()
        filteredKeyPairs.forEach(keyPair => {
            const privateKey = Buffer.from(base58.decode(keyPair.privateKey))
            ed25519Fulfillment.sign(
                Buffer.from(transactionHash, 'hex'),
                privateKey
            )
        })
        return ed25519Fulfillment.serializeUri()
    }
}

// TODO: https://github.com/avajs/ava/issues/1190
test('', () => 'dirty hack. TODO: Exclude this file from being run by ava')
