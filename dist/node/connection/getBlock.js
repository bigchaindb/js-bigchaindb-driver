'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = getBlock;

var _getApiUrls = require('./getApiUrls');

var _getApiUrls2 = _interopRequireDefault(_getApiUrls);

var _request = require('../request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * @param blockId
 * @param API_PATH
 */
function getBlock(blockId, API_PATH) {
    return (0, _request2.default)((0, _getApiUrls2.default)(API_PATH)['blocks_detail'], {
        urlTemplateSpec: {
            blockId: blockId
        }
    });
}
module.exports = exports['default'];