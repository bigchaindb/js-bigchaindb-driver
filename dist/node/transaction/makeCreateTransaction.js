'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeCreateTransaction;

var _makeInputTemplate = require('./makeInputTemplate');

var _makeInputTemplate2 = _interopRequireDefault(_makeInputTemplate);

var _makeTransaction = require('./makeTransaction');

var _makeTransaction2 = _interopRequireDefault(_makeTransaction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function makeCreateTransaction(asset, metadata, outputs) {
    var assetDefinition = {
        'data': asset || null
    };

    for (var _len = arguments.length, issuers = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        issuers[_key - 3] = arguments[_key];
    }

    var inputs = issuers.map(function (issuer) {
        return (0, _makeInputTemplate2.default)([issuer]);
    });

    return (0, _makeTransaction2.default)('CREATE', assetDefinition, metadata, outputs, inputs);
}
module.exports = exports['default'];