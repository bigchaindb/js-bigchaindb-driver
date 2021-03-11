import type {
  Ed25519Sha256,
  Fulfillment,
  PreimageSha256,
  ThresholdSha256,
} from 'crypto-conditions';
import {
  Ed25519Sha256JSONCondition,
  PreimageSha256JSONCondition,
  ThresholdSha256JSONCondition,
} from './utils/ccJsonify';

export interface TransactionInput {
  fulfillment: string;
  fulfills: {
    output_index: number;
    transaction_id: string;
  } | null;
  owners_before: string[];
}
export interface TransactionOutput {
  amount: string;
  condition:
    | PreimageSha256JSONCondition
    | ThresholdSha256JSONCondition
    | Ed25519Sha256JSONCondition;
  public_keys: string[];
}

export enum TransactionOperations {
  CREATE = 'CREATE',
  TRANSFER = 'TRANSFER',
}

export interface TransactionCommon<
  O = TransactionOperations,
  A = Record<string, unknown>,
  M = Record<string, unknown>
> {
  id?: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  version: string;
  metadata: M;
  operation: O;
  asset: TransactionAssetMap<O, A>;
}

export interface TransactionCommonSigned<
  O = TransactionOperations,
  A = Record<string, unknown>,
  M = Record<string, unknown>
> extends Omit<TransactionCommon<O, A, M>, 'id'> {
  id: string;
}

export type TransactionAssetMap<
  Operation,
  A = Record<string, unknown>
> = Operation extends TransactionOperations.CREATE
  ? {
      data: A;
    }
  : {
      id: string;
    };

export interface CreateTransaction<
  A = Record<string, unknown>,
  M = Record<string, unknown>
> extends TransactionCommon<TransactionOperations.CREATE, A, M> {
  id: string;
  asset: TransactionAssetMap<TransactionOperations.CREATE, A>;
  operation: TransactionOperations.CREATE;
}

export interface TransferTransaction<M = Record<string, unknown>>
  extends TransactionCommon<TransactionOperations.TRANSFER, any, M> {
  id: string;
  asset: TransactionAssetMap<TransactionOperations.TRANSFER>;
  operation: TransactionOperations.TRANSFER;
}

export interface TransactionUnspentOutput {
  tx: TransactionCommon;
  output_index: number;
}

interface TxTemplate {
  id: null;
  operation: null;
  outputs: [];
  inputs: [];
  metadata: null;
  asset: null;
  version: '2.0';
}

declare type DelegateSignFunction = (
  serializedTransaction: string,
  input: TransactionInput,
  index?: number
) => string;

declare type DelegateSignFunctionAsync = (
  serializedTransaction: string,
  input: TransactionInput,
  index?: number
) => Promise<string>;

export default class Transaction {
  static serializeTransactionIntoCanonicalString<O = TransactionOperations>(
    transaction: TransactionCommon<O>
  ): string;

  static serializeTransactionIntoCanonicalString(
    transaction: CreateTransaction | TransferTransaction
  ): string;

  static makeEd25519Condition(publicKey: string): Ed25519Sha256JSONCondition;

  static makeEd25519Condition(
    publicKey: string,
    json: true
  ): Ed25519Sha256JSONCondition;

  static makeEd25519Condition(publicKey: string, json: false): Ed25519Sha256;

  static makeEd25519Condition(
    publicKey: string,
    json?: boolean
  ): Ed25519Sha256 | Ed25519Sha256JSONCondition;

  static makeSha256Condition(preimage: string): PreimageSha256JSONCondition;

  static makeSha256Condition(
    preimage: string,
    json: true
  ): PreimageSha256JSONCondition;

  static makeSha256Condition(preimage: string, json: false): PreimageSha256;

  static makeSha256Condition(
    preimage: string,
    json?: boolean
  ): PreimageSha256 | PreimageSha256JSONCondition;

  static makeThresholdCondition(
    threshold: number,
    subconditions: (string | Fulfillment)[]
  ): ThresholdSha256JSONCondition;

  static makeThresholdCondition(
    threshold: number,
    subconditions: (string | Fulfillment)[],
    json: true
  ): ThresholdSha256JSONCondition;

  static makeThresholdCondition(
    threshold: number,
    subconditions: (string | Fulfillment)[],
    json: false
  ): ThresholdSha256;

  static makeThresholdCondition(
    threshold: number,
    subconditions: (string | Fulfillment)[],
    json?: boolean
  ): ThresholdSha256 | ThresholdSha256JSONCondition;

  static makeInputTemplate(
    publicKeys: string[],
    fulfills?: TransactionInput['fulfills'],
    fulfillment?: TransactionInput['fulfillment']
  ): TransactionInput;

  static makeOutput(
    condition:
      | PreimageSha256JSONCondition
      | ThresholdSha256JSONCondition
      | Ed25519Sha256JSONCondition,
    amount?: string
  ): TransactionOutput;

  static makeTransactionTemplate(): TxTemplate;

  static makeTransaction<
    O extends keyof TransactionOperations,
    A = Record<string, any>,
    M = Record<string, any>
  >(
    operation: O,
    asset: A,
    metadata: M,
    outputs: TransactionOutput[],
    inputs: TransactionInput[]
  ): TransactionCommon<O, A, M>;

  static makeCreateTransaction<
    A = Record<string, any>,
    M = Record<string, any>
  >(
    asset: A,
    metadata: M,
    outputs: TransactionOutput[],
    ...issuers: string[]
  ): CreateTransaction<A, M>;

  static makeTransferTransaction<M = Record<string, any>>(
    unspentOutputs: TransactionUnspentOutput[],
    outputs: TransactionOutput[],
    metadata: M
  ): TransferTransaction<M>;

  static signTransaction<O = TransactionOperations.CREATE>(
    transaction: TransactionCommon<O>,
    ...privateKeys: string[]
  ): TransactionCommonSigned<O>;


  static delegateSignTransaction<O = TransactionOperations.CREATE>(
    transaction: TransactionCommon<O>,
    signFn: DelegateSignFunction
  ): TransactionCommonSigned<O>;

  static delegateSignTransactionAsync<O = TransactionOperations.CREATE>(
    transaction: TransactionCommon<O>,
    signFn: DelegateSignFunctionAsync
  ): Promise<TransactionCommonSigned<O>>;
}
