'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = sha256Hash;

var _jsSha = require('js-sha3');

var _jsSha2 = _interopRequireDefault(_jsSha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sha256Hash(data) {
    return _jsSha2.default.sha3_256.create().update(data).hex();
}
module.exports = exports['default'];