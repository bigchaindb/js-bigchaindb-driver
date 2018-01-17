import { Buffer } from 'buffer'

import cc from 'crypto-conditions'

import ccJsonify from './utils/ccJsonify'


/**
 * @public
 * Create a Preimage-Sha256 Cryptocondition from a secret to put into an Output of a Transaction
 * @param {string} preimage Preimage to be hashed and wrapped in a crypto-condition
 * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
 * @returns {object} Preimage-Sha256 Condition (that will need to wrapped in an Output)
 */
export default function makeSha256Condition(preimage, json = true) {
    const sha256Fulfillment = new cc.PreimageSha256()
    sha256Fulfillment.preimage = new Buffer(preimage)

    if (json) {
        return ccJsonify(sha256Fulfillment)
    }
    return sha256Fulfillment
}
