'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = signTransaction;

var _buffer = require('buffer');

var _bs = require('bs58');

var _bs2 = _interopRequireDefault(_bs);

var _fiveBellsCondition = require('five-bells-condition');

var _fiveBellsCondition2 = _interopRequireDefault(_fiveBellsCondition);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

var _serializeTransactionIntoCanonicalString = require('./serializeTransactionIntoCanonicalString');

var _serializeTransactionIntoCanonicalString2 = _interopRequireDefault(_serializeTransactionIntoCanonicalString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function signTransaction(transaction) {
    for (var _len = arguments.length, privateKeys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        privateKeys[_key - 1] = arguments[_key];
    }

    var signedTx = (0, _clone2.default)(transaction);
    signedTx.inputs.forEach(function (input, index) {
        var privateKey = privateKeys[index];
        var privateKeyBuffer = new _buffer.Buffer(_bs2.default.decode(privateKey));
        var serializedTransaction = (0, _serializeTransactionIntoCanonicalString2.default)(transaction);
        var ed25519Fulfillment = new _fiveBellsCondition2.default.Ed25519();
        ed25519Fulfillment.sign(new _buffer.Buffer(serializedTransaction), privateKeyBuffer);
        var fulfillmentUri = ed25519Fulfillment.serializeUri();

        input.fulfillment = fulfillmentUri;
    });

    return signedTx;
}
module.exports = exports['default'];