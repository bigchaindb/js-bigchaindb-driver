import test from 'ava'
import cc from 'crypto-conditions'
import { Ed25519Keypair, Transaction, ccJsonLoad } from '../../src'
import sha256Hash from '../../src/sha256Hash'

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

test('Sha256Condition fulfillment', t => {
    const preimage = 'secret'
    const target = {
        details: {
            type_id: 0,
            bitmask: 3,
            preimage,
            type: 'fulfillment'
        },
        uri: 'ni:///sha-256;K7gNU3sdo-OL0wNhqoVWhr3g6s1xYv72ol_pe_Unols?fpt=preimage-sha-256&cost=6'
    }
    t.deepEqual(target, Transaction.makeSha256Condition(preimage))
})


test('Threshold condition encoding', t => {
    const publicKey = '4zvwRjXUKGfvwnParsHAS3HuSVzV5cA4McphgmoCtajS'
    const ed25519 = Transaction.makeEd25519Condition(publicKey, false)
    const condition = Transaction.makeThresholdCondition(1, [ed25519, ed25519])
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
    // Sign in order to get the tx id, needed for the unique fulfillment in the transfer transaction
    const signCreateTransaction = Transaction.signTransaction(txCreate, alice.privateKey)

    const txTransfer = Transaction.makeTransferTransaction(
        [{ tx: signCreateTransaction, output_index: 0 }],
        [Transaction.makeOutput(Transaction.makeEd25519Condition(alice.publicKey))],
        {}
    )
    const txSigned = Transaction.signTransaction(txTransfer, alice.privateKey)

    // Here reconstruct the fulfillment of the transfer transaction
    // The tx is serialized, and extended with tx_id and output index, and then hashed into bytes
    const msg = Transaction.serializeTransactionIntoCanonicalString(txTransfer)
    const msgUniqueFulfillment = txTransfer.inputs[0].fulfills ? msg
        .concat(txTransfer.inputs[0].fulfills.transaction_id)
        .concat(txTransfer.inputs[0].fulfills.output_index) : msg
    const msgHash = sha256Hash(msgUniqueFulfillment)

    t.truthy(cc.validateFulfillment(
        txSigned.inputs[0].fulfillment, txCreate.outputs[0].condition.uri,
        Buffer.from(msgHash, 'hex')
    ))
})


test('CryptoConditions JSON load', t => {
    const cond = ccJsonLoad({
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
    const cond = ccJsonLoad({
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
