# [![js-bigchaindb-driver](media/repo-banner@2x.png)](https://www.bigchaindb.com)

> Official JavaScript driver for [BigchainDB](https://github.com/bigchaindb/bigchaindb) with some naive helpers to get you on your way making transactions in Node.js and the browser.

[![npm](https://img.shields.io/npm/v/bigchaindb-driver.svg)](https://www.npmjs.com/package/bigchaindb-driver)
[![codecov](https://codecov.io/gh/bigchaindb/js-bigchaindb-driver/branch/master/graph/badge.svg)](https://codecov.io/gh/bigchaindb/js-bigchaindb-driver)
[![js ascribe](https://img.shields.io/badge/js-ascribe-39BA91.svg)](https://github.com/ascribe/javascript)
[![Build Status](https://travis-ci.org/bigchaindb/js-bigchaindb-driver.svg?branch=master)](https://travis-ci.org/bigchaindb/js-bigchaindb-driver)
[![Greenkeeper badge](https://badges.greenkeeper.io/bigchaindb/js-bigchaindb-driver.svg)](https://greenkeeper.io/)

## Compatibility

| BigchainDB Server | BigchainDB JavaScript Driver |
| ----------------- |------------------------------|
| `0.10`            | `0.1.0`                      |


## Contents

* [Installation](#installation)
   * [Example: Create a transaction](#example-create-a-transaction)
* [Documentation](#bigchaindb-documentation)
* [Authors](#authors)
* [License](#license)

## Node.js

### Installation

```bash
npm install bigchaindb-driver
```

#### Example: Create a transaction

```js
import * as driver from 'bigchaindb-driver'

// BigchainDB server instance or IPDB (e.g. https://test.ipdb.io/api/v1/)
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
)

// Optional: You've got everything you need, except for an asset
// and metadata. Maybe define them here, any JSON-serializable object
// will do

// Ok, now that you have a transaction, you need to *sign* it
// cause, you know... cryptography and ¯\_(ツ)_/¯

// Sign/fulfill the transaction with private keys
const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey)

// Send the transaction off to BigchainDB
let conn = new driver.Connection(API_PATH, { 'Content-Type': 'application/json' })

conn.postTransaction(txSigned)
    .then(() => conn.getStatus(txSigned.id))
    .then((res) => console.log('Transaction status:', res.status))
```

## Browser

### Installation and Usage

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>HTML5 boilerplate – all you really need…</title>
        <!-- Adjust version to your needs -->
        <script src="https://unpkg.com/bigchaindb-driver@0.1.0/dist/browser/bundle.window.min.js"></script>
        <script>

            // BigchainDB server instance or IPDB (e.g. https://test.ipdb.io/api/v1/)
            const API_PATH = 'http://localhost:9984/api/v1/'

            // Create a new user with a public-private key pair
            // (or a whole bunch of them, nobody's counting)
            const alice = new BigchainDB.Ed25519Keypair()

            // Construct a transaction payload
            // `BigchainDB.Transaction.makeCreateTransaction()`: create a new asset
            // `BigchainDB.Transaction.makeTransferTransaction()`: transfer an existing asset
            const tx = BigchainDB.Transaction.makeCreateTransaction(
                { assetMessage: 'My very own asset...' },
                { metaDataMessage: 'wrapped in a transaction' },
                // A transaction needs an output
                // `BigchainDB.Transaction.makeOutput()`: requires a crypto-condition
                // `BigchainDB.Transaction.makeEd25519Condition()`: simple public key output
                [ BigchainDB.Transaction.makeOutput(
                        BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))
                ],
                alice.publicKey
            )

            // Optional: You've got everything you need, except for an asset
            // and metadata. Maybe define them here, any JSON-serializable object
            // will do

            // Ok, now that you have a transaction, you need to *sign* it
            // cause, you know... cryptography and ¯\_(ツ)_/¯

            // Sign/fulfill the transaction with private keys
            const txSigned = BigchainDB.Transaction.signTransaction(tx, alice.privateKey)

            // Send the transaction off to BigchainDB
            let conn = new BigchainDB.Connection(API_PATH, { 'Content-Type': 'application/json' })

            conn.postTransaction(txSigned)
                .then(() => conn.getStatus(txSigned.id))
                .then((res) => console.log('Transaction status:', res.status))
                    </script>
    </head>

    <body id="home">

    <h1>Hello BigchainDB</h1>

    </body>
</html>
```

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
