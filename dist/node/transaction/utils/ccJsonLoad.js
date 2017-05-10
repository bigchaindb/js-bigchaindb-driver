'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = ccJsonLoad;

var _bs = require('bs58');

var _bs2 = _interopRequireDefault(_bs);

var _fiveBellsCondition = require('five-bells-condition');

var _fiveBellsCondition2 = _interopRequireDefault(_fiveBellsCondition);

var _buffer = require('buffer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 * Loads a crypto-condition class (Fulfillment or Condition) from a BigchainDB JSON object
 * @param {object} conditionJson
 * @returns {cc.Condition} Ed25519 Condition (that will need to wrapped in an Output)
 */
function ccJsonLoad(conditionJson) {

    if ('hash' in conditionJson) {
        var condition = new _fiveBellsCondition2.default.Condition();
        condition.type = conditionJson.type_id;
        condition.bitmask = conditionJson.bitmask;
        condition.hash = new _buffer.Buffer(_bs2.default.decode(conditionJson.hash));
        condition.maxFulfillmentLength = parseInt(conditionJson.max_fulfillment_length, 10);
        return condition;
    } else {
        var fulfillment = void 0;

        if (conditionJson.type_id === 2) {
            fulfillment = new _fiveBellsCondition2.default.ThresholdSha256();
            fulfillment.threshold = conditionJson.threshold;
            conditionJson.subfulfillments.forEach(function (subfulfillment) {
                subfulfillment = ccJsonLoad(subfulfillment);
                if ('getConditionUri' in subfulfillment) fulfillment.addSubfulfillment(subfulfillment);else if ('serializeUri' in subfulfillment) fulfillment.addSubcondition(subfulfillment);
            });
        }

        if (conditionJson.type_id === 0) {
            fulfillment = new _fiveBellsCondition2.default.PreimageSha256();
            fulfillment.preimage = new _buffer.Buffer(conditionJson.preimage);
        }

        if (conditionJson.type_id === 4) {
            fulfillment = new _fiveBellsCondition2.default.Ed25519();
            fulfillment.publicKey = new _buffer.Buffer(_bs2.default.decode(conditionJson.public_key));
            if (conditionJson.signature) fulfillment.signature = new _buffer.Buffer(_bs2.default.decode(conditionJson.signature));
        }
        return fulfillment;
    }
}
module.exports = exports['default'];