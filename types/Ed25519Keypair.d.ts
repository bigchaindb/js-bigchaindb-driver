// Copyright BigchainDB GmbH and BigchainDB contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

export default class Ed25519Keypair {
  publicKey: string;
  privateKey: string;

  constructor(seed?: Buffer);
}
