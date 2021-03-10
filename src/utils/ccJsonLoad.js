// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import base58 from 'bs58'
import { Condition, Ed25519Sha256, ThresholdSha256 } from 'crypto-conditions'

/**
 * Loads a crypto-condition class (Fulfillment or Condition) from a BigchainDB JSON object
 * @param {Object} conditionJson
 * @returns {cc.Condition} Ed25519 Condition (that will need to wrapped in an Output)
 */
export default function ccJsonLoad(conditionJson) {
    if ('hash' in conditionJson) {
        const condition = new Condition()
        condition.setTypeId(conditionJson.type_id)
        condition.setSubtypes(conditionJson.bitmask)
        condition.setHash(base58.decode(conditionJson.hash))
        // TODO: fix this, maxFulfillmentLength cannot be set in CryptoCondition lib
        condition.maxFulfillmentLength = parseInt(conditionJson.max_fulfillment_length, 10)
        return condition
    } else {
        let fulfillment

        if (conditionJson.type === 'threshold-sha-256') {
            fulfillment = new ThresholdSha256()
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
            fulfillment = new Ed25519Sha256()
            fulfillment.setPublicKey(base58.decode(conditionJson.public_key))
        }
        return fulfillment
    }
}
