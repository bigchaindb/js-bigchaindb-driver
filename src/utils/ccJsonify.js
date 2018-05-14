import base58 from 'bs58'

/**
 * Serializes a crypto-condition class (Condition or Fulfillment) into a BigchainDB-compatible JSON
 * @param {cc.Fulfillment} fulfillment base58 encoded Ed25519 public key for recipient of the Transaction
 * @returns {Object} Ed25519 Condition (that will need to wrapped in an Output)
 */
export default function ccJsonify(fulfillment) {
    let conditionUri

    if ('getConditionUri' in fulfillment) {
        conditionUri = fulfillment.getConditionUri()
    } else if ('serializeUri' in fulfillment) {
        conditionUri = fulfillment.serializeUri()
    }

    const jsonBody = {
        'details': {},
        'uri': conditionUri,
    }

    if (fulfillment.getTypeId() === 0) {
        jsonBody.details.type_id = 0
        jsonBody.details.bitmask = 3

        if ('preimage' in fulfillment) {
            jsonBody.details.preimage = fulfillment.preimage.toString()
            jsonBody.details.type = 'fulfillment'
        }
    }

    if (fulfillment.getTypeId() === 2) {
        return {
            'details': {
                'type': 'threshold-sha-256',
                'threshold': fulfillment.threshold,
                'subconditions': fulfillment.subconditions.map((subcondition) => {
                    const subconditionJson = ccJsonify(subcondition.body)
                    return subconditionJson.details
                })
            },
            'uri': conditionUri,
        }
    }

    if (fulfillment.getTypeId() === 4) {
        jsonBody.details.type = 'ed25519-sha-256'

        if ('publicKey' in fulfillment) {
            jsonBody.details.public_key = base58.encode(fulfillment.publicKey)
        }
    }

    if ('hash' in fulfillment) {
        jsonBody.details.hash = base58.encode(fulfillment.hash)
        jsonBody.details.max_fulfillment_length = fulfillment.maxFulfillmentLength
        jsonBody.details.type = 'condition'
    }

    return jsonBody
}
