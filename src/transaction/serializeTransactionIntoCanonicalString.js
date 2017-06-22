import stableStringify from 'json-stable-stringify'
import clone from 'clone'


/**
 * @public
 * Canonically serializes a transaction into a string by sorting the keys
 * @param {object} (transaction)
 * @return {string} a canonically serialized Transaction
 */
export default function serializeTransactionIntoCanonicalString(transaction) {
    // BigchainDB signs fulfillments by serializing transactions into a
    // "canonical" format where
    const tx = clone(transaction)
    // TODO: set fulfillments to null
    // Sort the keys
    return stableStringify(tx, (a, b) => (a.key > b.key ? 1 : -1))
}
