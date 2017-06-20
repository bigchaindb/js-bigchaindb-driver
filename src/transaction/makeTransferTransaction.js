import makeInputTemplate from './makeInputTemplate'
import makeTransaction from './makeTransaction'


// TODO: Can we remove `export` here somehow, but still be able to import the
// function for tests?
export function _makeTransferTransaction(
        unspentTransaction,
        metadata,
        outputs,
        ...fulfilledOutputs
    ) {
    const inputs = fulfilledOutputs.map((outputIndex) => {
        const fulfilledOutput = unspentTransaction.outputs[outputIndex]
        const transactionLink = {
            'output': outputIndex,
            'transaction_id': unspentTransaction.id,
        }

        return makeInputTemplate(fulfilledOutput.public_keys, transactionLink)
    })

    const assetLink = {
        'id': unspentTransaction.operation === 'CREATE' ? unspentTransaction.id
                                                        : unspentTransaction.asset.id
    }

    return ['TRANSFER', assetLink, metadata, outputs, inputs]
}

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

// TODO:
// - Make `metadata` optional argument
// - Rename `fulfilledOutputs`, e.g. inputs
// TODO: `outputs` should throw or include output in array if no array was
// passed
export default function makeTransferTransaction(...args) {
    return makeTransaction(..._makeTransferTransaction(...args))
}
