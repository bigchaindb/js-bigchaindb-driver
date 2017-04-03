import stableStringify from 'json-stable-stringify';
import clone from 'clone';


export default function serializeTransactionIntoCanonicalString(transaction, input) {
    // BigchainDB signs fulfillments by serializing transactions into a "canonical" format where
    // each fulfillment URI is removed before sorting the remaining keys
    const tx = clone(transaction);
    let match;
    tx.inputs.forEach((_input) => {

        if (!(_input && input && _input['fulfills'] && input['fulfills']
            && !(_input['fulfills']['txid'] === input['fulfills']['txid']
            && _input['fulfills']['output'] === input['fulfills']['output']))) {
            match = tx.inputs.indexOf(_input);
        }
        _input.fulfillment = null;
    });
    if (input && match >= 0 && tx.inputs) {
        tx.inputs = [tx.inputs[match]];
    }
    // Sort the keys
    return stableStringify(tx, (a, b) => (a.key > b.key ? 1 : -1));
}