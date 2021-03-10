// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import type { Condition, Fulfillment } from 'crypto-conditions';
import type { JSONCondition } from './ccJsonify';

// TODO: improve returned type accuracy
export default function ccJsonLoad<T = TypeId.Ed25519Sha256>(
  conditionJson: JSONCondition[T]
): Condition | Fulfillment;
