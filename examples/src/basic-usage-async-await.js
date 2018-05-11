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


// Call async basic usage function
basicUsage()


async function basicUsage() {
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
    await conn.postTransaction(txCreateAliceSimpleSigned)
    await conn.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id)

    const txTransferBob = driver.Transaction.makeTransferTransaction(
        [{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
        { price: '100 euro' }
    )

    const txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)

    await conn.postTransaction(txTransferBobSigned)
    await conn.pollStatusAndFetchTransaction(txTransferBobSigned.id)


    // ======== Querying Assets ======== //
    const assets = await conn.searchAssets('Bicycle Inc.')
    console.log(assets) // eslint-disable-line no-console
}
