import { Buffer } from 'buffer'
import base58 from 'bs58'
import cc from 'crypto-conditions'
import clone from 'clone'

import serializeTransactionIntoCanonicalString from './serializeTransactionIntoCanonicalString'


/**
 * @public
 * Sign the given `transaction` with the given `privateKey`s, returning a new copy of `transaction`
 * that's been signed.
 * Note: Only generates Ed25519 Fulfillments. Thresholds and other types of Fulfillments are left as
 * an exercise for the user.
 * @param {object} transaction Transaction to sign. `transaction` is not modified.
 * @param {...string} privateKeys Private keys associated with the issuers of the `transaction`.
 *                                Looped through to iteratively sign any Input Fulfillments found in
 *                                the `transaction`.
 * @returns {object} The signed version of `transaction`.
 */
export default function signTransaction(transaction, ...privateKeys) {
    const signedTx = clone(transaction)
    signedTx.inputs.forEach((input, index) => {
        const privateKey = privateKeys[index]
        const privateKeyBuffer = new Buffer(base58.decode(privateKey))
        const serializedTransaction = serializeTransactionIntoCanonicalString(transaction)
        const ed25519Fulfillment = new cc.Ed25519Sha256()
        ed25519Fulfillment.sign(new Buffer(serializedTransaction), privateKeyBuffer)
        const fulfillmentUri = ed25519Fulfillment.serializeUri()

        input.fulfillment = fulfillmentUri
    })

    return signedTx
}
