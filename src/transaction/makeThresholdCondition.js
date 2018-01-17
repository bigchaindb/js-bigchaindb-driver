import cc from 'crypto-conditions'

import ccJsonify from './utils/ccJsonify'


/**
 * @public
 * Create an Sha256 Threshold Cryptocondition from threshold to put into an Output of a Transaction
 * @param {number} threshold
 * @param {Array} [subconditions=[]]
 * @param {boolean} [json=true] If true returns a json object otherwise a crypto-condition type
 * @returns {object} Sha256 Threshold Condition (that will need to wrapped in an Output)
 */
export default function makeThresholdCondition(threshold, subconditions = [], json = true) {
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
