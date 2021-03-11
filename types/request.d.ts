// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import type { RequestConfig } from './baseRequest';

export interface Node {
  endpoint: string;
  headers: Record<string, string | string[]>;
}

export default class Request {
  private node: Node;
  private backoffTime: number;
  private retries: number;
  private connectionError?: Error;

  constructor(node: Node);

  request<O = Record<string, any>>(
    urlPath: string,
    config?: RequestConfig,
    timeout?: number,
    maxBackoffTime?: number
  ): Promise<O>;

  updateBackoffTime(maxBackoffTime: number): void;

  getBackoffTimedelta(): number;

  static sleep(ms: number): void;
}
