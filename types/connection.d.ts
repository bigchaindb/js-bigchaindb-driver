// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import type { RequestConfig } from './baseRequest';
import type { Node } from './request';
import type Transport from './transport';
import type {
  CreateTransaction,
  TransactionOperations,
  TransferTransaction,
  TransactionCommon,
} from './transaction';

declare const DEFAULT_NODE = 'http://localhost:9984/api/v1/';
declare const DEFAULT_TIMEOUT = 20000; // The default value is 20 seconds

export interface InputNode {
  endpoint: string;
}

export enum Endpoints {
  blocks = 'blocks',
  blocksDetail = 'blocksDetail',
  outputs = 'outputs',
  transactions = 'transactions',
  transactionsSync = 'transactionsSync',
  transactionsAsync = 'transactionsAsync',
  transactionsCommit = 'transactionsCommit',
  transactionsDetail = 'transactionsDetail',
  assets = 'assets',
  metadata = 'metadata',
}

export interface EndpointsUrl {
  [Endpoints.blocks]: 'blocks';
  [Endpoints.blocksDetail]: 'blocks/%(blockHeight)s';
  [Endpoints.outputs]: 'outputs';
  [Endpoints.transactions]: 'transactions';
  [Endpoints.transactionsSync]: 'transactions?mode=sync';
  [Endpoints.transactionsAsync]: 'transactions?mode=async';
  [Endpoints.transactionsCommit]: 'transactions?mode=commit';
  [Endpoints.transactionsDetail]: 'transactions/%(transactionId)s';
  [Endpoints.assets]: 'assets';
  [Endpoints.metadata]: 'metadata';
}

export interface EndpointsResponse<
  O = TransactionOperations.CREATE,
  A = Record<string, any>,
  M = Record<string, any>
> {
  [Endpoints.blocks]: number[];
  [Endpoints.blocksDetail]: {
    height: number;
    transactions: (CreateTransaction | TransferTransaction)[];
  };
  [Endpoints.outputs]: {
    transaction_id: string;
    output_index: number;
  }[];
  [Endpoints.transactions]: O extends TransactionOperations.CREATE
    ? CreateTransaction[]
    : O extends TransactionOperations.TRANSFER
    ? TransferTransaction[]
    : (CreateTransaction | TransferTransaction)[];
  [Endpoints.transactionsSync]: O extends TransactionOperations.CREATE
    ? CreateTransaction<A, M>
    : TransferTransaction<M>;
  [Endpoints.transactionsAsync]: O extends TransactionOperations.CREATE
    ? CreateTransaction<A, M>
    : TransferTransaction<M>;
  [Endpoints.transactionsCommit]: O extends TransactionOperations.CREATE
    ? CreateTransaction<A, M>
    : TransferTransaction<M>;
  [Endpoints.transactionsDetail]: O extends TransactionOperations.CREATE
    ? CreateTransaction<A, M>
    : TransferTransaction<M>;
  [Endpoints.assets]: { id: string; data: Record<string, any> }[];
  [Endpoints.metadata]: { id: string; metadata: Record<string, any> }[];
}

export default class Connection {
  private transport: Transport;
  private normalizedNodes: Node[];
  private headers: Record<string, string | string[]>;

  constructor(
    nodes: string | InputNode | (string | InputNode)[],
    headers?: Record<string, string | string[]>,
    timeout?: number
  );

  static normalizeNode(
    node: string | InputNode,
    headers: Record<string, string | string[]>
  ): Node;

  static getApiUrls<E extends keyof EndpointsUrl>(endpoint: E): EndpointsUrl[E];

  private _req<E extends keyof EndpointsUrl, O = Record<string, any>>(
    path: EndpointsUrl[E],
    options: RequestConfig
  ): Promise<O>;

  getBlock(
    blockHeight: number | string
  ): Promise<EndpointsResponse[Endpoints.blocksDetail]>;

  getTransaction<O = TransactionOperations.CREATE>(
    transactionId: string
  ): Promise<EndpointsResponse<O>[Endpoints.transactionsDetail]>;

  listBlocks(transactionId: string): Promise<EndpointsResponse[Endpoints.blocks]>;

  listOutputs(
    publicKey: string,
    spent?: boolean
  ): Promise<EndpointsResponse[Endpoints.outputs]>;

  listTransactions(
    assetId: string,
    operation?: TransactionOperations
  ): Promise<EndpointsResponse<typeof operation>[Endpoints.transactions]>;

  postTransaction<
    O = TransactionOperations.CREATE,
    A = Record<string, any>,
    M = Record<string, any>
  >(
    transaction: TransactionCommon<O>
  ): Promise<EndpointsResponse<O, A, M>[Endpoints.transactionsCommit]>;

  postTransactionSync<
    O = TransactionOperations.CREATE,
    A = Record<string, any>,
    M = Record<string, any>
  >(
    transaction: TransactionCommon<O>
  ): Promise<EndpointsResponse<O, A, M>[Endpoints.transactionsSync]>;

  postTransactionAsync<
    O = TransactionOperations.CREATE,
    A = Record<string, any>,
    M = Record<string, any>
  >(
    transaction: TransactionCommon<O>
  ): Promise<EndpointsResponse<O, A, M>[Endpoints.transactionsAsync]>;

  postTransactionCommit<
    O = TransactionOperations.CREATE,
    A = Record<string, any>,
    M = Record<string, any>
  >(
    transaction: TransactionCommon<O>
  ): Promise<EndpointsResponse<O, A, M>[Endpoints.transactionsCommit]>;

  searchAssets(search: string): Promise<EndpointsResponse[Endpoints.assets]>;

  searchMetadata(search: string): Promise<EndpointsResponse[Endpoints.metadata]>;
}
