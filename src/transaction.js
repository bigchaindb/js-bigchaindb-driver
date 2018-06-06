import { Buffer } from 'buffer'
import stableStringify from 'json-stable-stringify'
import clone from 'clone'
import base58 from 'bs58'
import cc from 'crypto-conditions'
import ccJsonify from './utils/ccJsonify'
import sha256Hash from './sha256Hash'

/**
 * Construct Transactions
 */
export default class Transaction {
    /**
     * Canonically serializes a transaction into a string by sorting the keys
     * @param {Object} (transaction)
     * @return {string} a canonically serialized Transaction
     */
    static serializeTransactionIntoCanonicalString(transaction) {
        // BigchainDB signs fulfillments by serializing transactions into a
        // "canonical" format where
        const tx = clone(transaction)
        // TODO: set fulfillments to null
        // Sort the keys
        return stableStringify(tx, (a, b) => (a.key > b.key ? 1 : -1))
    }

    static makeInputTemplate(publicKeys = [], fulfills = null, fulfillment = null) {
        return {
            fulfillment,
            fulfills,
            'owners_before': publicKeys,
        }
    }

    static makeTransactionTemplate() {
        const txTemplate = {
            'id': null,
            'operation': null,
            'outputs': [],
            'inputs': [],
            'metadata': null,
            'asset': null,
            'version': '2.0',
        }
        return txTemplate
    }

    static makeTransaction(operation, asset, metadata = null, outputs = [], inputs = []) {
        const tx = Transaction.makeTransactionTemplate()
        tx.operation = operation
        tx.asset = asset
        tx.metadata = metadata
        tx.inputs = inputs
        tx.outputs = outputs
        return tx
    }

    /**
     * Generate a `CREATE` transaction holding the `asset`, `metadata`, and `outputs`, to be signed by
     * the `issuers`.
     * @param {Object} asset Created asset's data
     * @param {Object} metadata Metadata for the Transaction
     * @param {Object[]} outputs Array of Output objects to add to the Transaction.
     *                           Think of these as the recipients of the asset after the transaction.
     *                           For `CREATE` Transactions, this should usually just be a list of
     *                           Outputs wrapping Ed25519 Conditions generated from the issuers' public
     *                           keys (so that the issuers are the recipients of the created asset).
     * @param {...string[]} issuers Public key of one or more issuers to the asset being created by this
     *                              Transaction.
     *                              Note: Each of the private keys corresponding to the given public
     *                              keys MUST be used later (and in the same order) when signing the
     *                              Transaction (`signTransaction()`).
     * @returns {Object} Unsigned transaction -- make sure to call signTransaction() on it before
     *                   sending it off!
     */
    static makeCreateTransaction(asset, metadata, outputs, ...issuers) {
        const assetDefinition = {
            'data': asset || null,
        }
        const inputs = issuers.map((issuer) => Transaction.makeInputTemplate([issuer]))

        return Transaction.makeTransaction('CREATE', assetDefinition, metadata, outputs, inputs)
    }

    /**
     * Create an Ed25519 Cryptocondition from an Ed25519 public key
     * to put into an Output of a Transaction
     * @param {string} publicKey base58 encoded Ed25519 public key for the recipient of the Transaction
     * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
     * @returns {Object} Ed25519 Condition (that will need to wrapped in an Output)
     */
    static makeEd25519Condition(publicKey, json = true) {
        const publicKeyBuffer = Buffer.from(base58.decode(publicKey))

        const ed25519Fulfillment = new cc.Ed25519Sha256()
        ed25519Fulfillment.setPublicKey(publicKeyBuffer)

        if (json) {
            return ccJsonify(ed25519Fulfillment)
        }

        return ed25519Fulfillment
    }

    /**
     * Create an Output from a Condition.
     * Note: Assumes the given Condition was generated from a
     * single public key (e.g. a Ed25519 Condition)
     * @param {Object} condition Condition (e.g. a Ed25519 Condition from `makeEd25519Condition()`)
     * @param {string} amount Amount of the output
     * @returns {Object} An Output usable in a Transaction
     */
    static makeOutput(condition, amount = '1') {
        if (typeof amount !== 'string') {
            throw new TypeError('`amount` must be of type string')
        }
        const publicKeys = []
        const getPublicKeys = details => {
            if (details.type === 'ed25519-sha-256') {
                if (!publicKeys.includes(details.public_key)) {
                    publicKeys.push(details.public_key)
                }
            } else if (details.type === 'threshold-sha-256') {
                details.subconditions.map(getPublicKeys)
            }
        }
        getPublicKeys(condition.details)
        return {
            condition,
            'amount': amount,
            'public_keys': publicKeys,
        }
    }

    /**
     * Create a Preimage-Sha256 Cryptocondition from a secret to put into an Output of a Transaction
     * @param {string} preimage Preimage to be hashed and wrapped in a crypto-condition
     * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
     * @returns {Object} Preimage-Sha256 Condition (that will need to wrapped in an Output)
     */
    static makeSha256Condition(preimage, json = true) {
        const sha256Fulfillment = new cc.PreimageSha256()
        sha256Fulfillment.preimage = Buffer.from(preimage)

        if (json) {
            return ccJsonify(sha256Fulfillment)
        }
        return sha256Fulfillment
    }

    /**
     * Create an Sha256 Threshold Cryptocondition from threshold to put into an Output of a Transaction
     * @param {number} threshold
     * @param {Array} [subconditions=[]]
     * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
     * @returns {Object} Sha256 Threshold Condition (that will need to wrapped in an Output)
     */
    static makeThresholdCondition(threshold, subconditions = [], json = true) {
        const thresholdCondition = new cc.ThresholdSha256()
        thresholdCondition.threshold = threshold

        subconditions.forEach((subcondition) => {
            // TODO: add support for Condition and URIs
            thresholdCondition.addSubfulfillment(subcondition)
        })

        if (json) {
            return ccJsonify(thresholdCondition)
        }

        return thresholdCondition
    }

    /**
     * Generate a `TRANSFER` transaction holding the `asset`, `metadata`, and `outputs`, that fulfills
     * the `fulfilledOutputs` of `unspentTransaction`.
     * @param {Object} unspentTransaction Previous Transaction you have control over (i.e. can fulfill
     *                                    its Output Condition)
     * @param {Object} metadata Metadata for the Transaction
     * @param {Object[]} outputs Array of Output objects to add to the Transaction.
     *                           Think of these as the recipients of the asset after the transaction.
     *                           For `TRANSFER` Transactions, this should usually just be a list of
     *                           Outputs wrapping Ed25519 Conditions generated from the public keys of
     *                           the recipients.
     * @param {...number} OutputIndices Indices of the Outputs in `unspentTransaction` that this
     *                                     Transaction fulfills.
     *                                     Note that listed public keys listed must be used (and in
     *                                     the same order) to sign the Transaction
     *                                     (`signTransaction()`).
     * @returns {Object} Unsigned transaction -- make sure to call signTransaction() on it before
     *                   sending it off!
     */
    // TODO:
    // - Make `metadata` optional argument
    static makeTransferTransaction(
        unspentOutputs,
        outputs,
        metadata
    ) {
        const inputs = unspentOutputs.map((unspentOutput) => {
            const { tx, outputIndex } = { tx: unspentOutput.tx, outputIndex: unspentOutput.output_index }
            const fulfilledOutput = tx.outputs[outputIndex]
            const transactionLink = {
                'output_index': outputIndex,
                'transaction_id': tx.id,
            }

            return Transaction.makeInputTemplate(fulfilledOutput.public_keys, transactionLink)
        })

        const assetLink = {
            'id': unspentOutputs[0].tx.operation === 'CREATE' ? unspentOutputs[0].tx.id
                : unspentOutputs[0].tx.asset.id
        }
        return Transaction.makeTransaction('TRANSFER', assetLink, metadata, outputs, inputs)
    }

    /**
     * Sign the given `transaction` with the given `privateKey`s, returning a new copy of `transaction`
     * that's been signed.
     * Note: Only generates Ed25519 Fulfillments. Thresholds and other types of Fulfillments are left as
     * an exercise for the user.
     * @param {Object} transaction Transaction to sign. `transaction` is not modified.
     * @param {...string} privateKeys Private keys associated with the issuers of the `transaction`.
     *                                Looped through to iteratively sign any Input Fulfillments found in
     *                                the `transaction`.
     * @returns {Object} The signed version of `transaction`.
     */
    static signTransaction(transaction, ...privateKeys) {
        const signedTx = clone(transaction)
        const serializedTransaction =
            Transaction.serializeTransactionIntoCanonicalString(transaction)

        signedTx.inputs.forEach((input, index) => {
            const privateKey = privateKeys[index]
            const privateKeyBuffer = Buffer.from(base58.decode(privateKey))

            const transactionUniqueFulfillment = input.fulfills ? serializedTransaction
                .concat(input.fulfills.transaction_id)
                .concat(input.fulfills.output_index) : serializedTransaction
            const transactionHash = sha256Hash(transactionUniqueFulfillment)
            const ed25519Fulfillment = new cc.Ed25519Sha256()
            ed25519Fulfillment.sign(Buffer.from(transactionHash, 'hex'), privateKeyBuffer)
            const fulfillmentUri = ed25519Fulfillment.serializeUri()

            input.fulfillment = fulfillmentUri
        })

        const serializedSignedTransaction =
            Transaction.serializeTransactionIntoCanonicalString(signedTx)
        signedTx.id = sha256Hash(serializedSignedTransaction)
        return signedTx
    }
}
