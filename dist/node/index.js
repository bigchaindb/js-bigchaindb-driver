'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.Ed25519Keypair = Ed25519Keypair;
exports.makeEd25519Condition = makeEd25519Condition;
exports.makeOutput = makeOutput;
exports.makeCreateTransaction = makeCreateTransaction;
exports.makeTransferTransaction = makeTransferTransaction;
exports.signTransaction = signTransaction;

var _buffer = require('buffer');

var _bs = require('bs58');

var _bs2 = _interopRequireDefault(_bs);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

var _fiveBellsCondition = require('five-bells-condition');

var _fiveBellsCondition2 = _interopRequireDefault(_fiveBellsCondition);

var _tweetnacl = require('tweetnacl');

var _tweetnacl2 = _interopRequireDefault(_tweetnacl);

var _jsSha = require('js-sha3');

var _jsSha2 = _interopRequireDefault(_jsSha);

var _jsonStableStringify = require('json-stable-stringify');

var _jsonStableStringify2 = _interopRequireDefault(_jsonStableStringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class Keypair Ed25519 keypair in base58 (as BigchainDB expects base58 keys)
 * @type {Object}
 * @property {string} publicKey
 * @property {string} privateKey
 */
function Ed25519Keypair() {
    var keyPair = _tweetnacl2.default.sign.keyPair();
    this.publicKey = _bs2.default.encode(keyPair.publicKey);

    // tweetnacl's generated secret key is the secret key + public key (resulting in a 64-byte buffer)
    this.privateKey = _bs2.default.encode(keyPair.secretKey.slice(0, 32));
}

/**
 * Create an Ed25519 Cryptocondition from an Ed25519 public key to put into an Output of a Transaction
 * @param {string} publicKey base58 encoded Ed25519 public key for the recipient of the Transaction
 * @returns {object} Ed25519 Condition (that will need to wrapped in an Output)
 */
function makeEd25519Condition(publicKey) {
    var publicKeyBuffer = new _buffer.Buffer(_bs2.default.decode(publicKey));

    var ed25519Fulfillment = new _fiveBellsCondition2.default.Ed25519();
    ed25519Fulfillment.setPublicKey(publicKeyBuffer);
    var conditionUri = ed25519Fulfillment.getConditionUri();

    return {
        'details': {
            'signature': null,
            'type_id': 4,
            'type': 'fulfillment',
            'bitmask': 32,
            'public_key': publicKey
        },
        'uri': conditionUri
    };
}

/**
 * Create an Output from a Condition.
 * Note: Assumes the given Condition was generated from a single public key (e.g. a Ed25519 Condition)
 * @param {object} condition Condition (e.g. a Ed25519 Condition from `makeEd25519Condition()`)
 * @param {number} amount Amount of the output
 * @returns {object} An Output usable in a Transaction
 */
function makeOutput(condition) {
    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return {
        amount: amount,
        condition: condition,
        'public_keys': [condition.details.public_key]
    };
}

/**
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
function makeCreateTransaction(asset, metadata, outputs) {
    var assetDefinition = {
        'data': asset || null
    };

    for (var _len = arguments.length, issuers = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        issuers[_key - 3] = arguments[_key];
    }

    var inputs = issuers.map(function (issuer) {
        return makeInputTemplate([issuer]);
    });

    return makeTransaction('CREATE', assetDefinition, metadata, outputs, inputs);
}

/**
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
function makeTransferTransaction(unspentTransaction, metadata, outputs) {
    for (var _len2 = arguments.length, fulfilledOutputs = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
        fulfilledOutputs[_key2 - 3] = arguments[_key2];
    }

    var inputs = fulfilledOutputs.map(function (outputIndex) {
        var fulfilledOutput = unspentTransaction.outputs[outputIndex];
        var transactionLink = {
            'output': outputIndex,
            'txid': unspentTransaction.id
        };

        return makeInputTemplate(fulfilledOutput.public_keys, transactionLink);
    });

    var assetLink = {
        'id': unspentTransaction.operation === 'CREATE' ? unspentTransaction.id : unspentTransaction.asset.id
    };

    return makeTransaction('TRANSFER', assetLink, metadata, outputs, inputs);
}

/**
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
function signTransaction(transaction) {
    for (var _len3 = arguments.length, privateKeys = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        privateKeys[_key3 - 1] = arguments[_key3];
    }

    var signedTx = (0, _clone2.default)(transaction);
    signedTx.inputs.forEach(function (input, index) {
        var privateKey = privateKeys[index];
        var privateKeyBuffer = new _buffer.Buffer(_bs2.default.decode(privateKey));
        var serializedTransaction = serializeTransactionIntoCanonicalString(transaction);

        var ed25519Fulfillment = new _fiveBellsCondition2.default.Ed25519();
        ed25519Fulfillment.sign(new _buffer.Buffer(serializedTransaction), privateKeyBuffer);
        var fulfillmentUri = ed25519Fulfillment.serializeUri();

        input.fulfillment = fulfillmentUri;
    });

    return signedTx;
}

/*********************
 * Transaction utils *
 *********************/

function makeTransactionTemplate() {
    return {
        'id': null,
        'operation': null,
        'outputs': [],
        'inputs': [],
        'metadata': null,
        'asset': null,
        'version': '0.9'
    };
}

function makeInputTemplate() {
    var publicKeys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var fulfills = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var fulfillment = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return {
        fulfillment: fulfillment,
        fulfills: fulfills,
        'owners_before': publicKeys
    };
}

function makeTransaction(operation, asset) {
    var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var outputs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    var inputs = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

    var tx = makeTransactionTemplate();
    tx.operation = operation;
    tx.asset = asset;
    tx.metadata = metadata;
    tx.inputs = inputs;
    tx.outputs = outputs;

    // Hashing must be done after, as the hash is of the Transaction (up to now)
    tx.id = hashTransaction(tx);
    return tx;
}

/****************
 * Crypto utils *
 ****************/

function hashTransaction(transaction) {
    // Safely remove any tx id from the given transaction for hashing
    var tx = (0, _extends3.default)({}, transaction);
    delete tx.id;

    return sha256Hash(serializeTransactionIntoCanonicalString(tx));
}

function sha256Hash(data) {
    return _jsSha2.default.sha3_256.create().update(data).hex();
}

function serializeTransactionIntoCanonicalString(transaction) {
    // BigchainDB signs fulfillments by serializing transactions into a "canonical" format where
    // each fulfillment URI is removed before sorting the remaining keys
    var tx = (0, _clone2.default)(transaction);
    tx.inputs.forEach(function (input) {
        input.fulfillment = null;
    });

    // Sort the keys
    return (0, _jsonStableStringify2.default)(tx, function (a, b) {
        return a.key > b.key ? 1 : -1;
    });
}