// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/* eslint-disable import/no-unresolved */

const driver = require('bigchaindb-driver')
require('dotenv').config()

// ======== Preparation ======== //
const conn = new driver.Connection('https://test.ipdb.io/api/v1/', {
    header1: 'header1_value',
    header2: 'header2_value'
})

const alice = new driver.Ed25519Keypair()
const bob = new driver.Ed25519Keypair()

const assetdata = {
    'bicycle': {
        'serial_number': 'abcd1234',
        'manufacturer': 'Bicycle Inc.',
    }
}

const metadata = { 'planet': 'earth' }

// ======== Create Transaction Bicycle ======== //
const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
    assetdata,
    metadata,
    [
        driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey))
    ],
    alice.publicKey
)

const txCreateAliceSimpleSigned =
    driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)

// ======== Post Transaction and Fetch Result ======== //
conn.postTransactionCommit(txCreateAliceSimpleSigned)
// ======== Transfer Bicycle to Bob ======== //
    .then((fetchedTx) => {
        const txTransferBob = driver.Transaction.makeTransferTransaction(
            [{ tx: fetchedTx, output_index: 0 }],
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
            { price: '100 euro' }
        )

        // Sign transfer transaction with Alice's private key
        const txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)

        return conn.postTransactionCommit(txTransferBobSigned)
    })
    .then(tx => {
        console.log('Is Bob the owner?', tx.outputs[0].public_keys[0] === bob.publicKey) // eslint-disable-line no-console
        console.log('Was Alice the previous owner?', tx.inputs[0].owners_before[0] === alice.publicKey) // eslint-disable-line no-console
    })

// ======== Search Asset by Serial Number ======== //
    .then(() => conn.searchAssets('abcd1234'))
    .then(assets => console.log('Found assets with serial number abcd1234:', assets)) // eslint-disable-line no-console
