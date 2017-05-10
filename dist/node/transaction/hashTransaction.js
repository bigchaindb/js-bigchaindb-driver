'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = hashTransaction;

var _serializeTransactionIntoCanonicalString = require('./serializeTransactionIntoCanonicalString');

var _serializeTransactionIntoCanonicalString2 = _interopRequireDefault(_serializeTransactionIntoCanonicalString);

var _sha256Hash = require('../sha256Hash');

var _sha256Hash2 = _interopRequireDefault(_sha256Hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hashTransaction(transaction) {
    // Safely remove any tx id from the given transaction for hashing
    var tx = _extends({}, transaction);
    delete tx.id;

    return (0, _sha256Hash2.default)((0, _serializeTransactionIntoCanonicalString2.default)(tx));
}
module.exports = exports['default'];