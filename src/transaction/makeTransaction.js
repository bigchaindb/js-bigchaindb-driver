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
    return tx
}
