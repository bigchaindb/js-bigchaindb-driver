const driver = require('bigchaindb-driver')


// ======== Preparation ======== //
const conn = new driver.Connection('https://test.bigchaindb.com/api/v1/', {
    app_id: 'c17a9968',
    app_key: '0b277b94893e7b0a5b4e6afd6bccb01d'
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
    return conn.postTransaction(txCreateSigned)
        .then(() => conn.pollStatusAndFetchTransaction(txCreateSigned.id))
}


// ======== Execute all promises in order to post transactions and fetch them ======== //
Promise.all(assetArray.map(createTx))


// ======== Querying Assets for Assetdata ======== //
    .then(() => conn.searchAssets('BicyclesInc'))
    .then(assets => console.log('Found assets with serial number "BicyclesInc":', assets)) // eslint-disable-line no-console


// ======== Querying Assets for Metadata ======== //
    .then(() => conn.searchMetadata('Pluto'))
    .then(assets => console.log('Found assets with metadata "Pluto":', assets)) // eslint-disable-line no-console
