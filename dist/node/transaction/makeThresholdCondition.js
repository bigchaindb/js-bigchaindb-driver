'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeThresholdCondition;

var _fiveBellsCondition = require('five-bells-condition');

var _fiveBellsCondition2 = _interopRequireDefault(_fiveBellsCondition);

var _ccJsonify = require('./utils/ccJsonify');

var _ccJsonify2 = _interopRequireDefault(_ccJsonify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * Create an Sha256 Threshold Cryptocondition from threshold to put into an Output of a Transaction
 * @param {number} threshold
 * @param {Array} [subconditions=[]]
 * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
 * @returns {object} Sha256 Threshold Condition (that will need to wrapped in an Output)
 */
function makeThresholdCondition(threshold) {
    var subconditions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var json = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    var thresholdCondition = new _fiveBellsCondition2.default.ThresholdSha256();
    thresholdCondition.threshold = threshold;

    subconditions.forEach(function (subcondition) {
        // TODO: add support for Condition and URIs
        thresholdCondition.addSubfulfillment(subcondition);
    });

    if (json) {
        return (0, _ccJsonify2.default)(thresholdCondition);
    }

    return thresholdCondition;
}
module.exports = exports['default'];