// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import Request, { Node } from './request';
import type { RequestConfig } from './baseRequest';

export default class Transport {
  private connectionPool: Request[];
  private timeout: number;
  private maxBackoffTime: number;

  constructor(nodes: Node[], timeout: number);

  pickConnection(): Request;

  forwardRequest<O = Record<string, any>>(
    path: string,
    config: RequestConfig
  ): Promise<O>;
}
