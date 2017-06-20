import makeInputTemplate from './makeInputTemplate'
import makeTransaction from './makeTransaction'


/**
 * @public
 * Generate a `CREATE` transaction holding the `asset`, `metadata`, and `outputs`, to be signed by
 * the `issuers`.
 * @param {object} asset Created asset's data
 * @param {object} metadata Metadata for the Transaction
 * @param {object[]} outputs Array of Output objects to add to the Transaction.
 *                           Think of these as the recipients of the asset after the transaction.
 *                           For `CREATE` Transactions, this should usually just be a list of
 *                           Outputs wrapping Ed25519 Conditions generated from the issuers' public
 *                           keys (so that the issuers are the recipients of the created asset).
 * @param {...string[]} issuers Public key of one or more issuers to the asset being created by this
 *                              Transaction.
 *                              Note: Each of the private keys corresponding to the given public
 *                              keys MUST be used later (and in the same order) when signing the
 *                              Transaction (`signTransaction()`).
 * @returns {object} Unsigned transaction -- make sure to call signTransaction() on it before
 *                   sending it off!
 */
export default function makeCreateTransaction(asset, metadata, outputs, ...issuers) {
    const assetDefinition = {
        'data': asset || null,
    }
    const inputs = issuers.map((issuer) => makeInputTemplate([issuer]))

    return makeTransaction('CREATE', assetDefinition, metadata, outputs, inputs)
}
