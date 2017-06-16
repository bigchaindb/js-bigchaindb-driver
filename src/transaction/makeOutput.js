/**
 * @public
 * Create an Output from a Condition.
 * Note: Assumes the given Condition was generated from a single public key (e.g. a Ed25519 Condition)
 * @param {object} condition Condition (e.g. a Ed25519 Condition from `makeEd25519Condition()`)
 * @param {string} amount Amount of the output
 * @returns {object} An Output usable in a Transaction
 */
export default function makeOutput(condition, amount = '1') {
    if (typeof amount !== 'string') {
        throw new TypeError('`amount` must be of type string')
    }
    return {
        'amount': amount,
        condition,
        'public_keys': condition.details.hasOwnProperty('public_key') ?
            [condition.details.public_key] : [],
    }
}
