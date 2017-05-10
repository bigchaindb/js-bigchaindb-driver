'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeOutput;
/**
 * @public
 * Create an Output from a Condition.
 * Note: Assumes the given Condition was generated from a single public key (e.g. a Ed25519 Condition)
 * @param {object} condition Condition (e.g. a Ed25519 Condition from `makeEd25519Condition()`)
 * @param {number} amount Amount of the output
 * @returns {object} An Output usable in a Transaction
 */
function makeOutput(condition) {
    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return {
        amount: JSON.stringify(amount),
        condition: condition,
        'public_keys': condition.details.hasOwnProperty('public_key') ? [condition.details.public_key] : []
    };
}
module.exports = exports['default'];