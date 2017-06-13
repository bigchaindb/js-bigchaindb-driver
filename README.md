# [![js-bigchaindb-driver](media/repo-banner@2x.png)](https://www.bigchaindb.com)

> Official JavaScript driver for [BigchainDB](https://github.com/bigchaindb/bigchaindb) with some naive helpers to get you on your way making transactions in Node.js and the browser.

[![npm](https://img.shields.io/npm/v/bigchaindb-driver.svg)](https://www.npmjs.com/package/bigchaindb-driver)
[![js ascribe](https://img.shields.io/badge/js-ascribe-39BA91.svg)](https://github.com/ascribe/javascript)
[![Build Status](https://travis-ci.org/bigchaindb/js-bigchaindb-driver.svg?branch=master)](https://travis-ci.org/bigchaindb/js-bigchaindb-driver)
[![Greenkeeper badge](https://badges.greenkeeper.io/bigchaindb/js-bigchaindb-driver.svg)](https://greenkeeper.io/)

## Compatibility

| BigchainDB Server | BigchainDB JavaScript Driver |
| ----------------- |------------------------------|
| `~=0.10.1` | `~=1.0.0` |


## Contents

* [Installation](#installation)
* [Usage](#usage)
   * [Example: Create a transaction](#example-create-a-transaction)
   * [More examples](#more-examples)
* [Documentation](#bigchaindb-documentation)
* [Speed Optimizations](#speed-optimizations)
* [Warnings](#warnings)
* [npm Releases](#npm-releases)
* [Authors](#authors)
* [License](#license)

## Installation

```bash
npm install bigchaindb-driver
```

## Usage

You'll probably need a babel here and a bundler there. Alternatively, use one of the bundled dist versions:

- `dist/bundle/`: Babelified and packaged with dependencies, so you can drop it in anywhere you want.
- `dist/node/`: Babelified into a CommonJS module, so you can drop it in on any node project.

### Example: Create a transaction

```js
import * as driver from 'bigchaindb-driver'

// http(s)://<bigchaindb-API-url>/ (e.g. http://localhost:9984/api/v1/)
const API_PATH = 'http://localhost:9984/api/v1/'

// Create a new user with a public-private key pair
// (or a whole bunch of them, nobody's counting)
const alice = new driver.Ed25519Keypair()

// Construct a transaction payload
// `driver.Transaction.makeCreateTransaction()`: create a new asset
// `driver.Transaction.makeTransferTransaction()`: transfer an existing asset
const tx = driver.Transaction.makeCreateTransaction(
    { assetMessage: 'My very own asset...' },
    { metaDataMessage: 'wrapped in a transaction' },
    // A transaction needs an output
    // `driver.Transaction.makeOutput()`: requires a crypto-condition
    // `driver.Transaction.makeEd25519Condition()`: simple public key output
    [ driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(alice.publicKey))
    ],
    alice.publicKey
);

// Optional: You've got everything you need, except for an asset 
// and metadata. Maybe define them here, any JSON-serializable object 
// will do

// Ok, now that you have a transaction, you need to *sign* it
// cause, you know... cryptography and ¯\_(ツ)_/¯

// Sign/fulfill the transaction with private keys
const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey)

// Send the transaction off to BigchainDB
let conn = new driver.Connection(PATH, { 'Content-Type': 'application/json' })

conn.postTransaction(txSigned)
    .then(() => conn.getStatus(txSigned.id))
    .then((res) => console.log('Transaction status:', res.status))
```

### More examples

You may also be interested in some [long-form tutorials with actual code](https://github.com/bigchaindb/kyber):

- [Kyber](https://github.com/bigchaindb/kyber): full suite of BigchainDB repos with tutorials, examples and experiments included.

## BigchainDB Documentation

- [HTTP API Reference](https://docs.bigchaindb.com/projects/server/en/latest/http-client-server-api.html)
- [The Transaction Model](https://docs.bigchaindb.com/projects/server/en/latest/data-models/transaction-model.html?highlight=crypto%20conditions)
- [Inputs and Outputs](https://docs.bigchaindb.com/projects/server/en/latest/data-models/inputs-outputs.html)
- [Asset Transfer](https://docs.bigchaindb.com/projects/py-driver/en/latest/usage.html#asset-transfer)
- [All BigchainDB Documentation](https://docs.bigchaindb.com/)

## Speed Optimizations

This implementation plays "safe" by using JS-native (or downgradable) libraries for its crypto-related functions to keep compatibilities with the browser. If you do want some more speed, feel free to explore the following: 

* [chloride](https://github.com/dominictarr/chloride), or its underlying [sodium](https://github.com/paixaop/node-sodium) library
* [node-sha3](https://github.com/phusion/node-sha3) -- **MAKE SURE** to use [steakknife's fork](https://github.com/steakknife/node-sha3) if [the FIPS 202 upgrade](https://github.com/phusion/node-sha3/pull/25) hasn't been merged (otherwise, you'll run into all kinds of hashing problems)

## Warnings

> Crypto-conditions

Make sure you keep using a crypto-conditions implementation that implements the older v1 draft (e.g.
[`five-bells-condition@v3.3.1`](https://github.com/interledgerjs/five-bells-condition/releases/tag/v3.3.1)).

BigchainDB Server 0.10 does not implement the newer version of the spec and **WILL** fail if you try using a newer implementation of crypto-conditions.

> SHA3

Make sure to use a SHA3 implementation that has been upgraded as per [FIPS 202](http://csrc.nist.gov/publications/drafts/fips-202/fips_202_draft.pdf). Otherwise, the hashes you generate **WILL** be invalid in the eyes of the BigchainDB Server.

> Ed25519

If you do end up replacing `tweetnacl` with `chloride` (or any other `Ed25519` package), you might want to double check that it gives you a correct public/private (or verifying/signing, if they use
that lingo) key pair.

An example BigchainDB Server-generated key pair (encoded in `base58`):

- Public: `DjPMHDD9JtgypDKY38mPz9f6owjAMAKhLuN1JfRAat8C`
- Private: `7Gf5YRch2hYTyeLxqNLgTY63D9K5QH2UQ7LYFeBGuKvo`

Your package should be able to take in the decoded version of the **private** key and return you the same **public** key (once you encode that to `base58`).

## npm Releases

For a new **patch release**, execute on the machine where you're logged into your npm account:

```bash
npm run release
```

Command is powered by [`release-it`](https://github.com/webpro/release-it) package, defined in the `package.json`.

That's what the command does without any user interaction:

1. create release commit by updating version in `package.json`
1. create tag for that release commit
1. push commit & tag
1. create a new release on GitHub, with change log auto-generated from commit messages
1. update local dependencies to latest version
1. build bundled dist versions
1. publish to npm as a new release

If you want to create a **minor** or **major release**, use these commands:

```bash
npm run release-minor
```

```bash
npm run release-major
```

## Authors

* inspired by [`js-bigchaindb-quickstart`](https://github.com/sohkai/js-bigchaindb-quickstart) of @sohkhai [thanks]
* BigchainDB <dev@bigchaindb.com>

## License

```
Copyright 2017 BigchainDB GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
