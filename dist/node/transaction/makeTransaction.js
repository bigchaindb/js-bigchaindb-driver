'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeTransaction;

var _hashTransaction = require('./hashTransaction');

var _hashTransaction2 = _interopRequireDefault(_hashTransaction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeTransactionTemplate() {
    return {
        'id': null,
        'operation': null,
        'outputs': [],
        'inputs': [],
        'metadata': null,
        'asset': null,
        'version': '0.9'
    };
}

function makeTransaction(operation, asset) {
    var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var outputs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    var inputs = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

    var tx = makeTransactionTemplate();
    tx.operation = operation;
    tx.asset = asset;
    tx.metadata = metadata;
    tx.inputs = inputs;
    tx.outputs = outputs;

    // Hashing must be done after, as the hash is of the Transaction (up to now)
    tx.id = (0, _hashTransaction2.default)(tx);
    return tx;
}
module.exports = exports['default'];