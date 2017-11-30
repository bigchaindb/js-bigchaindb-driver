import serializeTransactionIntoCanonicalString from './serializeTransactionIntoCanonicalString'
import sha256Hash from '../sha256Hash'

export default function hashTransaction(transaction) {
    const tx = { ...transaction }
    return sha256Hash(serializeTransactionIntoCanonicalString(tx))
}
