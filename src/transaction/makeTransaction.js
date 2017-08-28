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
    tx.operation = operation
    tx.asset = asset
    tx.metadata = metadata
    tx.inputs = inputs
    tx.outputs = outputs

    // Hashing must be done after, as the hash is of the Transaction (up to now)
    tx.id = hashTransaction(tx)
    return tx
}
