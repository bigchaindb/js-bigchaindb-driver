import base58 from 'bs58';

/**
 * @public
 * Serializes a crypto-condition class (Condition or Fulfillment) into a BigchainDB-compatible JSON
 * @param {cc.Fulfillment} fulfillment base58 encoded Ed25519 public key for the recipient of the Transaction
 * @returns {object} Ed25519 Condition (that will need to wrapped in an Output)
 */
export default function ccJsonify(fulfillment) {

    let conditionUri;

    if ('getConditionUri' in fulfillment)
        conditionUri = fulfillment.getConditionUri();
    else if ('serializeUri' in fulfillment)
        conditionUri = fulfillment.serializeUri();

    let jsonBody = {
        'details': {},
        'uri': conditionUri,
    };

    if (fulfillment.getTypeId() === 0) {
        jsonBody.details.type_id = 0;
        jsonBody.details.bitmask = 3;

        if ('preimage' in fulfillment) {
            jsonBody.details.preimage = fulfillment.preimage.toString();
            jsonBody.details.type = 'fulfillment';
        }
    }

    if (fulfillment.getTypeId() === 2)
        return {
            'details': {
                'type_id': 2,
                'type': 'fulfillment',
                'bitmask': fulfillment.getBitmask(),
                'threshold': fulfillment.threshold,
                'subfulfillments': fulfillment.subconditions.map((subcondition) => {
                    const subconditionJson = ccJsonify(subcondition.body);
                    subconditionJson.details.weight = 1;
                    return subconditionJson.details;
                })
            },
            'uri': conditionUri,
        };

    if (fulfillment.getTypeId() === 4) {
        jsonBody.details.type_id = 4;
        jsonBody.details.bitmask = 32;

        if ('publicKey' in fulfillment) {
            jsonBody.details.signature = null;
            jsonBody.details.public_key = base58.encode(fulfillment.publicKey);
            jsonBody.details.type = 'fulfillment';
        }
    }

    if ('hash' in fulfillment) {
        jsonBody.details.hash = base58.encode(fulfillment.hash);
        jsonBody.details.max_fulfillment_length = fulfillment.maxFulfillmentLength;
        jsonBody.details.type = 'condition';
    }

    return jsonBody;
}
