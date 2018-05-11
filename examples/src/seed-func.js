/* eslint-disable import/no-unresolved */

import bip39 from 'bip39'

const driver = require('bigchaindb-driver')

// ======== Create Keypair ======== //
/**
 * Use a passphrase to derive a keypair
 * If you use the same seed -> you will derive the same keypair
 *
 * mnemnoicToSeed() transforms the passphrase you gave as an input
 * to a byteArray
 *
 * BigchainDB however only accepts an input length of 32 characters
 * so we have to slice this to give it as input for driver.Ed25519Keypair()
 *
 * Is it safe to slice? Yes, a seed of length 32 is very safe according
 * to related papers discussing this.
 */
const passphrase = 'This is a random passphrase'
const seed = bip39.mnemonicToSeed(passphrase).slice(0, 32)

const keypair = new driver.Ed25519Keypair(seed)

console.log(`Public Key: ${keypair.publicKey} - Private Key: ${keypair.privateKey}`) // eslint-disable-line no-console

// ======== Other Bip39 Functionality not related to BigchainDB ======== //

/* Create Random passphrase */
const mnemonic = bip39.generateMnemonic()
console.log('Random passphrase: ', mnemonic) // eslint-disable-line no-console

/* Validate mnemnoic */
console.log(bip39.validateMnemonic(mnemonic)) // eslint-disable-line no-console
console.log(bip39.validateMnemonic('some random strings together but to short')) // eslint-disable-line no-console
