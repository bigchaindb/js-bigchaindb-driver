// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import type { Condition, Fulfillment } from 'crypto-conditions';
import type { TypeId } from 'crypto-conditions/types/types';

interface BaseJSONCondition {
  details: {
    type: TypeName;
    hash?: string;
    max_fulfillment_length?: number;
    type?: 'fulfillement' | 'condition';
    [key: string]: any;
  };
  uri: string;
}

export interface Ed25519Sha256JSONCondition extends BaseJSONCondition {
  details: { type: TypeName.Ed25519Sha256; publicKey?: string };
}
export interface PreimageSha256JSONCondition extends BaseJSONCondition {
  details: {
    type: TypeName.PreimageSha256;
    type_id: 0;
    bitmask: 3;
    preimage?: string;
    type?: 'fulfillement';
  };
}

export interface ThresholdSha256JSONCondition extends BaseJSONCondition {
  details: {
    type: TypeName.ThresholdSha256;
    subConditions: (Ed25519Sha256JSONCondition | PreimageSha256JSONCondition)[];
  };
}

export type JSONConditionUnion =
  | PreimageSha256JSONCondition
  | Ed25519Sha256JSONCondition
  | ThresholdSha256JSONCondition;

export interface JSONConditions {
  [TypeId.ThresholdSha256]: ThresholdSha256JSONCondition;
  [TypeId.PreimageSha256]: PreimageSha256JSONCondition;
  [TypeId.Ed25519Sha256]: Ed25519Sha256JSONCondition;
}

export default function ccJsonify<T = TypeId.Ed25519Sha256>(
  fulfillment: Fulfillment | Condition
): JSONConditions[T];
