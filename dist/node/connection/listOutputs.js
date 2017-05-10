'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = listOutputs;

var _getApiUrls = require('./getApiUrls');

var _getApiUrls2 = _interopRequireDefault(_getApiUrls);

var _request = require('../request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * @param public_key
 * @param unspent
 * @param API_PATH
 * @param onlyJsonResponse
 */
function listOutputs(_ref, API_PATH) {
    var public_key = _ref.public_key,
        unspent = _ref.unspent;
    var onlyJsonResponse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    return (0, _request2.default)((0, _getApiUrls2.default)(API_PATH)['outputs'], {
        query: {
            public_key: public_key,
            unspent: unspent
        }
    }, onlyJsonResponse);
}
module.exports = exports['default'];