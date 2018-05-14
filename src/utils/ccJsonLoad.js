import { Buffer } from 'buffer'
import base58 from 'bs58'
import cc from 'crypto-conditions'

/**
 * Loads a crypto-condition class (Fulfillment or Condition) from a BigchainDB JSON object
 * @param {Object} conditionJson
 * @returns {cc.Condition} Ed25519 Condition (that will need to wrapped in an Output)
 */
export default function ccJsonLoad(conditionJson) {
    if ('hash' in conditionJson) {
        const condition = new cc.Condition()
        condition.type = conditionJson.type_id
        condition.bitmask = conditionJson.bitmask
        condition.hash = Buffer.from(base58.decode(conditionJson.hash))
        condition.maxFulfillmentLength = parseInt(conditionJson.max_fulfillment_length, 10)
        return condition
    } else {
        let fulfillment

        if (conditionJson.type === 'threshold-sha-256') {
            fulfillment = new cc.ThresholdSha256()
            fulfillment.threshold = conditionJson.threshold
            conditionJson.subconditions.forEach((subconditionJson) => {
                const subcondition = ccJsonLoad(subconditionJson)
                if ('getConditionUri' in subcondition) {
                    fulfillment.addSubfulfillment(subcondition)
                } else if ('serializeUri' in subcondition) {
                    fulfillment.addSubcondition(subcondition)
                }
            })
        }

        if (conditionJson.type === 'ed25519-sha-256') {
            fulfillment = new cc.Ed25519Sha256()
            fulfillment.publicKey = Buffer.from(base58.decode(conditionJson.public_key))
        }
        return fulfillment
    }
}
