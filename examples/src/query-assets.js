// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/* eslint-disable import/no-unresolved */

const driver = require('bigchaindb-driver')
require('dotenv').config()

// ======== Preparation ======== //
const conn = new driver.Connection('https://example.com/api/v1/', {
    header1: 'header1_value',
    header2: 'header2_value'
})

const alice = new driver.Ed25519Keypair()

// ======== Asset Array ======== //
const assetArray = []
assetArray.push({ 'bicycle': { 'serial_number': 'abc', 'manufacturer': 'BicyclesInc' } })
assetArray.push({ 'bicycle': { 'serial_number': 'cde', 'manufacturer': 'BicyclesInc' } })
assetArray.push({ 'bicycle': { 'serial_number': 'fgh', 'manufacturer': 'BicyclesInc' } })

const metadata = { 'planet': 'Pluto' }

// ======== Create Transactions for bicycles ======== //
function createTx(assetdata) {
    const txCreate = driver.Transaction.makeCreateTransaction(
        assetdata,
        metadata,
        [
            driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey))
        ],
        alice.publicKey
    )

    const txCreateSigned = driver.Transaction.signTransaction(txCreate, alice.privateKey)
    return conn.postTransactionCommit(txCreateSigned)
}

// ======== Execute all promises in order to post transactions and fetch them ======== //
Promise.all(assetArray.map(createTx))

// ======== Querying Assets for Assetdata ======== //
    .then(() => conn.searchAssets('BicyclesInc'))
    .then(assets => console.log('Found assets with serial number "BicyclesInc":', assets)) // eslint-disable-line no-console

// ======== Querying Assets for Metadata ======== //
    .then(() => conn.searchMetadata('Pluto'))
    .then(assets => console.log('Found assets with metadata "Pluto":', assets)) // eslint-disable-line no-console
