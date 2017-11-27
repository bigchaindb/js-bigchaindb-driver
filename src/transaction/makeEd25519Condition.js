import { Buffer } from 'buffer'

import base58 from 'bs58'
import cc from 'crypto-conditions'

import ccJsonify from './utils/ccJsonify'


/**
 * @public
 * Create an Ed25519 Cryptocondition from an Ed25519 public key to put into an Output of a Transaction
 * @param {string} publicKey base58 encoded Ed25519 public key for the recipient of the Transaction
 * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
 * @returns {object} Ed25519 Condition (that will need to wrapped in an Output)
 */
export default function makeEd25519Condition(publicKey, json = true) {
    const publicKeyBuffer = new Buffer(base58.decode(publicKey))

    const ed25519Fulfillment = new cc.Ed25519Sha256()
    ed25519Fulfillment.setPublicKey(publicKeyBuffer)

    if (json) {
        return ccJsonify(ed25519Fulfillment)
    }

    return ed25519Fulfillment
}
