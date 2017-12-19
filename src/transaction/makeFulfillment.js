export default function makeFulfillment(issuers = []) {
    if (issuers.length === 1) {
        const fulfillment = {
            type: 'ed25519-sha-256',
            public_keys: issuers
        }
        return fulfillment
    } else {
        const subcdts = []
        issuers.map((issuer) => (
            subcdts.push({ type: 'ed25519-sha-256',
                public_key: issuer
            })
        ))
        const fulfillment = {
            type: 'threshold-sha-256',
            subconditions: subcdts
        }
        return fulfillment
    }
}
