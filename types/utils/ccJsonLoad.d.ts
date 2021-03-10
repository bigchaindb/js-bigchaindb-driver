// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import type {
  Condition,
  Ed25519Sha256,
  PreimageSha256,
  ThresholdSha256,
} from 'crypto-conditions';
import type {
  Ed25519Sha256JSONCondition,
  JSONCondition,
  PreimageSha256JSONCondition,
  ThresholdSha256JSONCondition,
} from './ccJsonify';

declare function ccJsonLoad(
  conditionJson: PreimageSha256JSONCondition
): PreimageSha256;

declare function ccJsonLoad(
  conditionJson: ThresholdSha256JSONCondition
): ThresholdSha256;

declare function ccJsonLoad(
  conditionJson: Ed25519Sha256JSONCondition
): Ed25519Sha256;

declare function ccJsonLoad(conditionJson: JSONCondition): Condition;

export default ccJsonLoad;
