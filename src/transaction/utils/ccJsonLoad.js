import { Buffer } from 'buffer'
import base58 from 'bs58'
import cc from 'five-bells-condition'

/**
 * @public
 * Loads a crypto-condition class (Fulfillment or Condition) from a BigchainDB JSON object
 * @param {object} conditionJson
 * @returns {cc.Condition} Ed25519 Condition (that will need to wrapped in an Output)
 */
export default function ccJsonLoad(conditionJson) {
    if ('hash' in conditionJson) {
        const condition = new cc.Condition()
        condition.type = conditionJson.type_id
        condition.bitmask = conditionJson.bitmask
        condition.hash = new Buffer(base58.decode(conditionJson.hash))
        condition.maxFulfillmentLength = parseInt(conditionJson.max_fulfillment_length, 10)
        return condition
    } else {
        let fulfillment

        if (conditionJson.type_id === 2) {
            fulfillment = new cc.ThresholdSha256()
            fulfillment.threshold = conditionJson.threshold
            conditionJson.subfulfillments.forEach((subfulfillmentJson) => {
                const subfulfillment = ccJsonLoad(subfulfillmentJson)
                if ('getConditionUri' in subfulfillment) {
                    fulfillment.addSubfulfillment(subfulfillment)
                } else if ('serializeUri' in subfulfillment) {
                    fulfillment.addSubcondition(subfulfillment)
                }
            })
        }

        if (conditionJson.type_id === 0) {
            fulfillment = new cc.PreimageSha256()
            fulfillment.preimage = new Buffer(conditionJson.preimage)
        }

        if (conditionJson.type_id === 4) {
            fulfillment = new cc.Ed25519()
            fulfillment.publicKey = new Buffer(base58.decode(conditionJson.public_key))
            if (conditionJson.signature) {
                fulfillment.signature = new Buffer(base58.decode(conditionJson.signature))
            }
        }
        return fulfillment
    }
}
