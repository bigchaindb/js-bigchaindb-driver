// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

declare type FilterFn = (val: any, key?: string) => void;

declare function filterFromObject<I = Record<string, any>>(
  obj: I,
  filter: Array | FilterFn,
  conf: { isInclusion?: boolean } = {}
): Partial<I>;

declare function applyFilterOnObject<I = Record<string, any>>(
  obj: I,
  filterFn?: FilterFn
): Partial<I>;

declare function selectFromObject<I = Record<string, any>>(
  obj: I,
  filter: Array | FilterFn
): Partial<I>;

export default function sanitize<I = Record<string, any>>(
  obj: I
): Partial<I> | I;
