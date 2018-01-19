import toposort from 'toposort'

function generateGraph(txs) {
    const graph = []
    txs.forEach(tx => {
        tx.inputs.forEach(input => {
            if (input.fulfills) {
                graph.push([tx.id, input.fulfills.transaction_id])
            }
        })
    })

    return graph
}


/**
 * @public
 * Topological sort algorithm for transactions
 * Used for endpoint: /transactions?assetId
 * @param {object} txs Array of transactions
 * @returns {object} Returns transactions in order of dependency
 */
export default function topsortTransactions(txs) {
    const graph = generateGraph(txs)
    return toposort(graph).reverse()
}
