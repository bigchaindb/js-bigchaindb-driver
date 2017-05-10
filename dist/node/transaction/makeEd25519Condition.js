'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeEd25519Condition;

var _buffer = require('buffer');

var _bs = require('bs58');

var _bs2 = _interopRequireDefault(_bs);

var _fiveBellsCondition = require('five-bells-condition');

var _fiveBellsCondition2 = _interopRequireDefault(_fiveBellsCondition);

var _ccJsonify = require('./utils/ccJsonify');

var _ccJsonify2 = _interopRequireDefault(_ccJsonify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * Create an Ed25519 Cryptocondition from an Ed25519 public key to put into an Output of a Transaction
 * @param {string} publicKey base58 encoded Ed25519 public key for the recipient of the Transaction
 * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
 * @returns {object} Ed25519 Condition (that will need to wrapped in an Output)
 */
function makeEd25519Condition(publicKey) {
    var json = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    var publicKeyBuffer = new _buffer.Buffer(_bs2.default.decode(publicKey));

    var ed25519Fulfillment = new _fiveBellsCondition2.default.Ed25519();
    ed25519Fulfillment.setPublicKey(publicKeyBuffer);

    if (json) {
        return (0, _ccJsonify2.default)(ed25519Fulfillment);
    }

    return ed25519Fulfillment;
}
module.exports = exports['default'];