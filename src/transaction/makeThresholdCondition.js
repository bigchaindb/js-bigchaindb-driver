import { Buffer } from 'buffer';

import base58 from 'bs58';
import cc from 'five-bells-condition';

import ccJsonify from './utils/ccJsonify';
/**
 * Create an Ed25519 Cryptocondition from an Ed25519 public key to put into an Output of a Transaction
 * @param {string} publicKey base58 encoded Ed25519 public key for the recipient of the Transaction
 * @returns {object} Ed25519 Condition (that will need to wrapped in an Output)
 */
export default function makeThresholdCondition(thresholdCondition, ccFormat=false) {
    if (ccFormat) return new cc.ThresholdSha256();

    return ccJsonify(thresholdCondition)
}
