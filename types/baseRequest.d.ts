// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

export interface RequestConfig {
  headers?: Record<string, string | string[]>;
  jsonBody?: Record<string, any>;
  query?: Record<string, any>;
  method?: 'GET' | ' POST' | 'PUT';
  urlTemplateSpec?: any[] | Record<string, any>;
  [key: string]: any;
}

export function ResponseError(
  message: string,
  status?: number,
  requestURI?: string
): void;

declare function timeout<T = Response>(
  ms: number,
  promise: Promise<T>
): Promise<T>;

declare function handleResponse(res: Response): Response;

export default function baseRequest(
  url: string,
  config: RequestConfig,
  requestTimeout?: number
): Promise<Response>;
