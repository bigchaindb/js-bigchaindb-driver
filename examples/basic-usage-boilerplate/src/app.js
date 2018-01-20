// const driver = require('../../../src/index')
import * as driver from 'bigchaindb-driver'

// ======== Preparation ======== //
const conn = new driver.Connection('https://test.bigchaindb.com/api/v1/', {
    app_id: 'c17a9968',
    app_key: '0b277b94893e7b0a5b4e6afd6bccb01d'
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
    [driver.Transaction.makeOutput(
        driver.Transaction.makeEd25519Condition(alice.publicKey))
    ],
    alice.publicKey
)

const txCreateAliceSimpleSigned =
    driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)
console.log(txCreateAliceSimpleSigned)

// ======== Post Transaction and Fetch Result ======== //
conn.postTransaction(txCreateAliceSimpleSigned)
    // Check status of transaction every 0.5 seconds until fulfilled
    .then(() => conn.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id))
    .then(retrievedTx => {
        console.log('Transaction', retrievedTx.id, 'successfully posted.')
        return retrievedTx
    })

    // Check status after transaction has completed (result: { 'status': 'valid' })
    // If you check the status of a transaction before it's added to BigchainDB,
    // BigchainDb will return that the transaction is still waiting in the 'backlog'
    .then(() => conn.getStatus(txCreateAliceSimpleSigned.id))
    .then(status => console.log('Retrieved status method 2: ', status))

// ======== Transfer Bicycle to Bob ======== //
    .then(() => {
        try {
            console.log(txCreateAliceSimpleSigned)
            const txTransferBob = driver.Transaction.makeTransferTransaction(
                [{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
                [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
                { price: '100 euro' }
            )

            // Sign transfer transaction with Alice's private key
            const txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)
            console.log('Posting signed transaction: ', txTransferBobSigned)
        } catch (err) {
            console.log(err)
        }

        return conn.postTransaction(txTransferBobSigned)
    })
    .then(res => {
        console.log('Response from BDB server:', res)
        return conn.pollStatusAndFetchTransaction(res.id)
    })
    .then(tx => {
        console.log('Is Bob the owner?', tx.outputs[0].public_keys[0] === bob.publicKey)
        console.log('Was Alice the previous owner?', tx.inputs[0].owners_before[0] === alice.publicKey)
    })

// ======== Search Asset by Serial Number ======== //
    .then(() => conn.searchAssets('Bicycle Inc.'))
    .then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets))
