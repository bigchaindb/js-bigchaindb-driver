export default function makeInputTemplate(publicKeys = [], fulfills = null, fulfillment = null) {
    return {
        fulfillment,
        fulfills,
        'owners_before': publicKeys,
    }
}
