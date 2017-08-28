import serializeTransactionIntoCanonicalString from './serializeTransactionIntoCanonicalString'
import sha256Hash from '../sha256Hash'

export default function hashTransaction(transaction) {
    // Safely remove any tx id from the given transaction for hashing
    const tx = { ...transaction }
    delete tx.id

    return sha256Hash(serializeTransactionIntoCanonicalString(tx))
}
