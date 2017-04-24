import stableStringify from 'json-stable-stringify';
import clone from 'clone';


export default function serializeTransactionIntoCanonicalString(transaction, input) {
    // BigchainDB signs fulfillments by serializing transactions into a "canonical" format where
    const tx = clone(transaction);
    // Sort the keys
    return stableStringify(tx, (a, b) => (a.key > b.key ? 1 : -1));
}