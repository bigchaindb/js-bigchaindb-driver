import { Buffer } from 'buffer'
import stableStringify from 'json-stable-stringify'
import clone from 'clone'
import base58 from 'bs58'
import cc from 'five-bells-condition'
import ccJsonify from './utils/ccJsonify'
import sha256Hash from './sha256Hash'

export default class Transaction {
    /**
     * @public
     * Canonically serializes a transaction into a string by sorting the keys
     * @param {object} (transaction)
     * @return {string} a canonically serialized Transaction
     */
    serializeTransactionIntoCanonicalString(transaction) {
        // BigchainDB signs fulfillments by serializing transactions into a
        // "canonical" format where
        const tx = this.clone(transaction)
        // TODO: set fulfillments to null
        // Sort the keys
        return stableStringify(tx, (a, b) => (a.key > b.key ? 1 : -1))
    }

    makeInputTemplate(publicKeys = [], fulfills = null, fulfillment = null) {
        const inputTemplate = {
            fulfillment,
            fulfills,
            'owners_before': publicKeys,
        }
        return inputTemplate
    }

    hashTransaction(transaction) {
        // Safely remove any tx id from the given transaction for hashing
        const tx = { ...transaction }
        delete tx.id

        return sha256Hash(this.serializeTransactionIntoCanonicalString(tx))
    }

    makeTransactionTemplate() {
        const txTemplate = {
            'id': null,
            'operation': null,
            'outputs': [],
            'inputs': [],
            'metadata': null,
            'asset': null,
            'version': '1.0',
        }
        return txTemplate
    }

    makeTransaction(operation, asset, metadata = null, outputs = [], inputs = []) {
        const tx = this.makeTransactionTemplate()
        tx.operation = operation
        tx.asset = asset
        tx.metadata = metadata
        tx.inputs = inputs
        tx.outputs = outputs

        // Hashing must be done after, as the hash is of the Transaction (up to now)
        tx.id = this.hashTransaction(tx)
        return tx
    }

    /**
     * @public
     * Generate a `CREATE` transaction holding the `asset`, `metadata`, and `outputs`, to be signed by
     * the `issuers`.
     * @param {object} asset Created asset's data
     * @param {object} metadata Metadata for the Transaction
     * @param {object[]} outputs Array of Output objects to add to the Transaction.
     *                           Think of these as the recipients of the asset after the transaction.
     *                           For `CREATE` Transactions, this should usually just be a list of
     *                           Outputs wrapping Ed25519 Conditions generated from the issuers' public
     *                           keys (so that the issuers are the recipients of the created asset).
     * @param {...string[]} issuers Public key of one or more issuers to the asset being created by this
     *                              Transaction.
     *                              Note: Each of the private keys corresponding to the given public
     *                              keys MUST be used later (and in the same order) when signing the
     *                              Transaction (`signTransaction()`).
     * @returns {object} Unsigned transaction -- make sure to call signTransaction() on it before
     *                   sending it off!
     */
    makeCreateTransaction(asset, metadata, outputs, ...issuers) {
        const assetDefinition = {
            'data': asset || null,
        }
        const inputs = issuers.map((issuer) => this.makeInputTemplate([issuer]))

        return this.makeTransaction('CREATE', assetDefinition, metadata, outputs, inputs)
    }

    /**
     * @public
     * Create an Ed25519 Cryptocondition from an Ed25519 public key
     * to put into an Output of a Transaction
     * @param {string} publicKey base58 encoded Ed25519 public key for the recipient of the Transaction
     * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
     * @returns {object} Ed25519 Condition (that will need to wrapped in an Output)
     */
    makeEd25519Condition(publicKey, json = true) {
        const publicKeyBuffer = new Buffer(this.base58.decode(publicKey))

        const ed25519Fulfillment = new cc.Ed25519Sha256()
        ed25519Fulfillment.setPublicKey(publicKeyBuffer)

        if (json) {
            return ccJsonify(ed25519Fulfillment)
        }

        return ed25519Fulfillment
    }

    /**
     * @public
     * Create an Output from a Condition.
     * Note: Assumes the given Condition was generated from a
     * single public key (e.g. a Ed25519 Condition)
     * @param {object} condition Condition (e.g. a Ed25519 Condition from `makeEd25519Condition()`)
     * @param {string} amount Amount of the output
     * @returns {object} An Output usable in a Transaction
     */
    makeOutput(condition, amount = '1') {
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
        this.getPublicKeys(condition.details)
        return {
            condition,
            'amount': amount,
            'public_keys': publicKeys,
        }
    }

    /**
     * @public
     * Create a Preimage-Sha256 Cryptocondition from a secret to put into an Output of a Transaction
     * @param {string} preimage Preimage to be hashed and wrapped in a crypto-condition
     * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
     * @returns {object} Preimage-Sha256 Condition (that will need to wrapped in an Output)
     */
    makeSha256Condition(preimage, json = true) {
        const sha256Fulfillment = new cc.PreimageSha256()
        sha256Fulfillment.preimage = new Buffer(preimage)

        if (json) {
            return this.ccJsonify(sha256Fulfillment)
        }
        return sha256Fulfillment
    }

    /**
     * @public
     * Create an Sha256 Threshold Cryptocondition from threshold to put into an Output of a Transaction
     * @param {number} threshold
     * @param {Array} [subconditions=[]]
     * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
     * @returns {object} Sha256 Threshold Condition (that will need to wrapped in an Output)
     */
    makeThresholdCondition(threshold, subconditions = [], json = true) {
        const thresholdCondition = new cc.ThresholdSha256()
        thresholdCondition.threshold = threshold

        subconditions.forEach((subcondition) => {
            // TODO: add support for Condition and URIs
            thresholdCondition.addSubfulfillment(subcondition)
        })

        if (json) {
            return this.ccJsonify(thresholdCondition)
        }

        return thresholdCondition
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
     * @param {...number} OutputIndices Indices of the Outputs in `unspentTransaction` that this
     *                                     Transaction fulfills.
     *                                     Note that listed public keys listed must be used (and in
     *                                     the same order) to sign the Transaction
     *                                     (`signTransaction()`).
     * @returns {object} Unsigned transaction -- make sure to call signTransaction() on it before
     *                   sending it off!
     */
    // TODO:
    // - Make `metadata` optional argument
    makeTransferTransaction(
        unspentTransaction,
        metadata,
        outputs,
        ...outputIndices
    ) {
        const inputs = outputIndices.map((outputIndex) => {
            const fulfilledOutput = unspentTransaction.outputs[outputIndex]
            const transactionLink = {
                'output_index': outputIndex,
                'transaction_id': unspentTransaction.id,
            }

            return this.makeInputTemplate(fulfilledOutput.public_keys, transactionLink)
        })

        const assetLink = {
            'id': unspentTransaction.operation === 'CREATE' ? unspentTransaction.id
                : unspentTransaction.asset.id
        }

        return this.makeTransaction('TRANSFER', assetLink, metadata, outputs, inputs)
    }

    /**
     * @public
     * Sign the given `transaction` with the given `privateKey`s, returning a new copy of `transaction`
     * that's been signed.
     * Note: Only generates Ed25519 Fulfillments. Thresholds and other types of Fulfillments are left as
     * an exercise for the user.
     * @param {object} transaction Transaction to sign. `transaction` is not modified.
     * @param {...string} privateKeys Private keys associated with the issuers of the `transaction`.
     *                                Looped through to iteratively sign any Input Fulfillments found in
     *                                the `transaction`.
     * @returns {object} The signed version of `transaction`.
     */
    signTransaction(transaction, ...privateKeys) {
        const signedTx = clone(transaction)
        signedTx.inputs.forEach((input, index) => {
            const privateKey = privateKeys[index]
            const privateKeyBuffer = new Buffer(base58.decode(privateKey))
            const serializedTransaction = this.serializeTransactionIntoCanonicalString(transaction)
            const ed25519Fulfillment = new cc.Ed25519Sha256()
            ed25519Fulfillment.sign(new Buffer(serializedTransaction), privateKeyBuffer)
            const fulfillmentUri = ed25519Fulfillment.serializeUri()

            input.fulfillment = fulfillmentUri
        })

        return signedTx
    }
}
