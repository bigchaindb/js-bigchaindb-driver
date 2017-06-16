import test from 'ava'
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

