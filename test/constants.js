import test from 'ava'
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


// TODO: https://github.com/avajs/ava/issues/1190
test('', () => 'dirty hack. TODO: Exclude this file from being run by ava')
