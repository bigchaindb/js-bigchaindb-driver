'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = listTransactions;

var _getApiUrls = require('./getApiUrls');

var _getApiUrls2 = _interopRequireDefault(_getApiUrls);

var _request = require('../request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * @param asset_id
 * @param operation
 * @param API_PATH
 */
function listTransactions(_ref, API_PATH) {
    var asset_id = _ref.asset_id,
        operation = _ref.operation;

    return (0, _request2.default)((0, _getApiUrls2.default)(API_PATH)['transactions'], {
        query: {
            asset_id: asset_id,
            operation: operation
        }
    });
}
module.exports = exports['default'];