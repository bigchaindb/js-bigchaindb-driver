import clone from 'clone'
import hashTransaction from './hashTransaction'


function makeTransactionTemplate() {
    return {
        'id': null,
        'operation': null,
        'outputs': [],
        'inputs': [],
        'metadata': null,
        'asset': null,
        'version': '1.0',
    }
}


export default function makeTransaction(operation, asset, metadata = null, outputs = [], inputs = []) {
    const tx = makeTransactionTemplate()

    const realInputs = clone(inputs)
    tx.operation = operation
    tx.asset = asset
    tx.metadata = metadata
    tx.inputs = inputs
    tx.outputs = outputs

    // Hashing must be done after, as the hash is of the Transaction (up to now)
    tx.inputs[0].fulfillment = null
    tx.id = hashTransaction(tx)
    tx.inputs = realInputs
    return tx
}
