'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = listBlocks;

var _getApiUrls = require('./getApiUrls');

var _getApiUrls2 = _interopRequireDefault(_getApiUrls);

var _request = require('../request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * @param tx_id
 * @param status
 * @param API_PATH
 */
function listBlocks(_ref, API_PATH) {
    var tx_id = _ref.tx_id,
        status = _ref.status;

    return (0, _request2.default)((0, _getApiUrls2.default)(API_PATH)['blocks'], {
        query: {
            tx_id: tx_id,
            status: status
        }
    });
}
module.exports = exports['default'];