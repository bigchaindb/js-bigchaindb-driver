import base58 from 'bs58';
import nacl from 'tweetnacl';
import sha3 from 'js-sha3';

/**
 * @class Keypair Ed25519 keypair in base58 (as BigchainDB expects base58 keys)
 * @type {Object}
 * @param {number} secret A seed that will be used as a key derivation function
 * @property {string} publicKey
 * @property {string} privateKey
 */
export default function Ed25519Keypair(secret) {
    let keyPair;
    if (secret) {
        // Quick and dirty: use key derivation function instead
        const secretHash = sha3.sha3_256
            .create()
            .update(secret)
            .array();
        keyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(secretHash))
    } else {
        keyPair = nacl.sign.keyPair();
    }
    this.publicKey = base58.encode(keyPair.publicKey);
    // tweetnacl's generated secret key is the secret key + public key (resulting in a 64-byte buffer)
    this.privateKey = base58.encode(keyPair.secretKey.slice(0, 32));
}
