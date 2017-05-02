import { Buffer } from 'buffer';

import base58 from 'bs58';
import cc from 'five-bells-condition';

import ccJsonify from './utils/ccJsonify';
/**
 * Create an Sha256 Threshold Cryptocondition from threshold to put into an Output of a Transaction
 * @param {number} threshold
 * @param {array} subconditions
 * @param {bool} json If true returns a json object otherwise a crypto-condition type
 * @returns {object} Sha256 Threshold Condition (that will need to wrapped in an Output)
 */
export default function makeThresholdCondition(threshold, subconditions=[], json=true) {
    const thresholdCondition = new cc.ThresholdSha256();
    thresholdCondition.threshold = threshold;

    subconditions.forEach((subcondition) => {
        // TODO: add support for Condition and URIs
        thresholdCondition.addSubfulfillment(subcondition);
    });

    if (json) {
        return ccJsonify(thresholdCondition)
    }

    return thresholdCondition
}
