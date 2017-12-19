import makeInputTemplate from './makeInputTemplate'
import makeTransaction from './makeTransaction'


/**
 * @public
 * Generate a `TRANSFER` transaction holding the `asset`, `metadata`, and `outputs`, that fulfills
 * the `fulfilledOutputs` of each `unspentTransaction`.
 * @param {object[]} unspentOutputs Array of unspent Transactions' Outputs.
 *                                  Each item contains Transaction itself
 *                                  and index of unspent Output for that Transaction.
 * @param {object[]} outputs Array of Output objects to add to the Transaction.
 *                           Think of these as the recipients of the asset after the transaction.
 *                           For `TRANSFER` Transactions, this should usually just be a list of
 *                           Outputs wrapping Ed25519 Conditions generated from the public keys of
 *                           the recipients.
 * @param {object} metadata Metadata for the Transaction - optional
 * @returns {object} Unsigned transaction -- make sure to call signTransaction() on it before
 *                   sending it off!
 */
export default function makeTransferTransaction(
    unspentOutputs,
    outputs,
    metadata
) {
    const inputs = unspentOutputs.map((unspentOutput) => {
        const tx = unspentOutput.tx
        const outputIndex = unspentOutput.output_index
        const fulfilledOutput = tx.outputs[outputIndex]
        const transactionLink = {
            'output_index': outputIndex,
            'transaction_id': tx.id,
        }

        return makeInputTemplate(fulfilledOutput.public_keys, transactionLink)
    })

    const assetLink = {
        'id': unspentOutputs[0].tx.operation === 'CREATE' ? unspentOutputs[0].tx.id
            : unspentOutputs[0].tx.asset.id
    }

    const meta = metadata || null

    return makeTransaction('TRANSFER', assetLink, meta, outputs, inputs)
}
