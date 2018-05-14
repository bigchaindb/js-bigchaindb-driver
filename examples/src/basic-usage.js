/* eslint-disable import/no-unresolved */

const driver = require('bigchaindb-driver')
require('dotenv').config()


// ======== Preparation ======== //
const conn = new driver.Connection('https://test.bigchaindb.com/api/v1/', {
    app_id: process.env.BIGCHAINDB_APP_ID,
    app_key: process.env.BIGCHAINDB_APP_KEY
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
conn.postTransaction(txCreateAliceSimpleSigned)
    // Check status of transaction every 0.5 seconds until fulfilled
    .then(() => conn.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id))


// ======== Transfer Bicycle to Bob ======== //
    .then(() => {
        const txTransferBob = driver.Transaction.makeTransferTransaction(
            [{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
            { price: '100 euro' }
        )

        // Sign transfer transaction with Alice's private key
        const txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)

        return conn.postTransaction(txTransferBobSigned)
    })
    .then(res => conn.pollStatusAndFetchTransaction(res.id))
    .then(tx => {
        console.log('Is Bob the owner?', tx.outputs[0].public_keys[0] === bob.publicKey) // eslint-disable-line no-console
        console.log('Was Alice the previous owner?', tx.inputs[0].owners_before[0] === alice.publicKey) // eslint-disable-line no-console
    })


// ======== Search Asset by Serial Number ======== //
    .then(() => conn.searchAssets('Bicycle Inc.'))
    .then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets)) // eslint-disable-line no-console
