'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = serializeTransactionIntoCanonicalString;

var _jsonStableStringify = require('json-stable-stringify');

var _jsonStableStringify2 = _interopRequireDefault(_jsonStableStringify);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * Canonically serializes a transaction into a string by sorting the keys
 * @param {object} (transaction)
 * @return {string} a canonically serialized Transaction
 */
function serializeTransactionIntoCanonicalString(transaction) {
  // BigchainDB signs fulfillments by serializing transactions into a "canonical" format where
  var tx = (0, _clone2.default)(transaction);
  // TODO: set fulfillments to null
  // Sort the keys
  return (0, _jsonStableStringify2.default)(tx, function (a, b) {
    return a.key > b.key ? 1 : -1;
  });
}
module.exports = exports['default'];