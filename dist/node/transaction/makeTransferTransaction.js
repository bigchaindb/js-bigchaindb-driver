'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeTransferTransaction;

var _makeInputTemplate = require('./makeInputTemplate');

var _makeInputTemplate2 = _interopRequireDefault(_makeInputTemplate);

var _makeTransaction = require('./makeTransaction');

var _makeTransaction2 = _interopRequireDefault(_makeTransaction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * Generate a `TRANSFER` transaction holding the `asset`, `metadata`, and `outputs`, that fulfills
 * the `fulfilledOutputs` of `unspentTransaction`.
 * @param {object} unspentTransaction Previous Transaction you have control over (i.e. can fulfill
 *                                    its Output Condition)
 * @param {object} metadata Metadata for the Transaction
 * @param {object[]} outputs Array of Output objects to add to the Transaction.
 *                           Think of these as the recipients of the asset after the transaction.
 *                           For `TRANSFER` Transactions, this should usually just be a list of
 *                           Outputs wrapping Ed25519 Conditions generated from the public keys of
 *                           the recipients.
 * @param {...number} fulfilledOutputs Indices of the Outputs in `unspentTransaction` that this
 *                                     Transaction fulfills.
 *                                     Note that the public keys listed in the fulfilled Outputs
 *                                     must be used (and in the same order) to sign the Transaction
 *                                     (`signTransaction()`).
 * @returns {object} Unsigned transaction -- make sure to call signTransaction() on it before
 *                   sending it off!
 */
function makeTransferTransaction(unspentTransaction, metadata, outputs) {
    for (var _len = arguments.length, fulfilledOutputs = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        fulfilledOutputs[_key - 3] = arguments[_key];
    }

    var inputs = fulfilledOutputs.map(function (outputIndex) {
        var fulfilledOutput = unspentTransaction.outputs[outputIndex];
        var transactionLink = {
            'output': outputIndex,
            'txid': unspentTransaction.id
        };

        return (0, _makeInputTemplate2.default)(fulfilledOutput.public_keys, transactionLink);
    });

    var assetLink = {
        'id': unspentTransaction.operation === 'CREATE' ? unspentTransaction.id : unspentTransaction.asset.id
    };

    return (0, _makeTransaction2.default)('TRANSFER', assetLink, metadata, outputs, inputs);
}
module.exports = exports['default'];