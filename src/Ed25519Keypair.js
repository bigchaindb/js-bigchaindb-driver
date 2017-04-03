import base58 from 'bs58';
import nacl from 'tweetnacl';

/**
 * @class Keypair Ed25519 keypair in base58 (as BigchainDB expects base58 keys)
 * @type {Object}
 * @property {string} publicKey
 * @property {string} privateKey
 */
export default function Ed25519Keypair() {
    const keyPair = nacl.sign.keyPair();
    this.publicKey = base58.encode(keyPair.publicKey);
    // tweetnacl's generated secret key is the secret key + public key (resulting in a 64-byte buffer)
    this.privateKey = base58.encode(keyPair.secretKey.slice(0, 32));
}
