'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeSha256Condition;

var _buffer = require('buffer');

var _fiveBellsCondition = require('five-bells-condition');

var _fiveBellsCondition2 = _interopRequireDefault(_fiveBellsCondition);

var _ccJsonify = require('./utils/ccJsonify');

var _ccJsonify2 = _interopRequireDefault(_ccJsonify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * Create a Preimage-Sha256 Cryptocondition from a secret to put into an Output of a Transaction
 * @param {string} preimage Preimage to be hashed and wrapped in a crypto-condition
 * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
 * @returns {object} Preimage-Sha256 Condition (that will need to wrapped in an Output)
 */
function makeSha256Condition(preimage) {
    var json = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    var sha256Fulfillment = new _fiveBellsCondition2.default.PreimageSha256();
    sha256Fulfillment.preimage = new _buffer.Buffer(preimage);

    if (json) {
        return (0, _ccJsonify2.default)(sha256Fulfillment);
    }
    return sha256Fulfillment;
}
module.exports = exports['default'];