'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeInputTemplate;
function makeInputTemplate() {
    var publicKeys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var fulfills = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var fulfillment = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return {
        fulfillment: fulfillment,
        fulfills: fulfills,
        'owners_before': publicKeys
    };
}
module.exports = exports['default'];