import makeInputTemplate from './makeInputTemplate'
import makeTransaction from './makeTransaction'


/**
 * @public
 * Generate a `TRANSFER` transaction holding the `asset`, `metadata`, and `outputs`, that fulfills
 * the `fulfilledOutputs` of `unspentTransaction`.
 * @param {object} unspentTransaction Previous Transaction you have control over (i.e. can fulfill
 *                                    its Output Condition)
 * @param {object} metadata Metadata for the Transaction
 * @param {object[]} outputs Array of Output objects to add to the Transaction.
 *                           Think of these as the recipients of the asset after the transaction.
 *                           For `TRANSFER` Transactions, this should usually just be a list of
 *                           Outputs wrapping Ed25519 Conditions generated from the public keys of
 *                           the recipients.
 * @param {...number} fulfilledOutputs Indices of the Outputs in `unspentTransaction` that this
 *                                     Transaction fulfills.
 *                                     Note that the public keys listed in the fulfilled Outputs
 *                                     must be used (and in the same order) to sign the Transaction
 *                                     (`signTransaction()`).
 * @returns {object} Unsigned transaction -- make sure to call signTransaction() on it before
 *                   sending it off!
 */
export default function makeTransferTransaction(
        unspentTransaction,
        metadata,
        outputs,
        ...fulfilledOutputs
    ) {
    const inputs = fulfilledOutputs.map((outputIndex) => {
        const fulfilledOutput = unspentTransaction.outputs[outputIndex]
        const transactionLink = {
            'output': outputIndex,
            'txid': unspentTransaction.id,
        }

        return makeInputTemplate(fulfilledOutput.public_keys, transactionLink)
    })

    const assetLink = {
        'id': unspentTransaction.operation === 'CREATE' ? unspentTransaction.id
                                                        : unspentTransaction.asset.id
    }

    return makeTransaction('TRANSFER', assetLink, metadata, outputs, inputs)
}
