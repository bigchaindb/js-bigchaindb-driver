import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import bip39 from 'bip39'
import './App.css';

import * as driver from '../../../dist/node'

class App extends Component {
  render() {
    const conn = new driver.Connection('http://localhost:9984/api/v1/')
    const createKeypair = (seed) => new driver.Ed25519Keypair(seed.slice(0, 32))
    const aliceMnemonic = bip39.generateMnemonic()
    const aliceKeypair = createKeypair(bip39.mnemonicToSeed(aliceMnemonic))

    function create() {
      const condition = driver.Transaction.makeEd25519Condition(aliceKeypair.publicKey, true)
      const output = driver.Transaction.makeOutput(condition)
      output.public_keys = [aliceKeypair.publicKey]
      const transaction = driver.Transaction.makeCreateTransaction(
        {asset:'data'},
        {metadata: 'metadata'},
        [output],
        aliceKeypair.publicKey
      )
      const txSigned = driver.Transaction.signTransaction(transaction, aliceKeypair.privateKey)
      conn.postTransaction(txSigned)
        .then(() => conn.pollStatusAndFetchTransaction(txSigned.id))
        .then(retrievedTx => {
          addToHtml(retrievedTx)
        })
    }

    function addToHtml(tx) {
      const element = <div id="data">Transaction: { tx.id }</div>;
      ReactDOM.render(
        element,
        document.getElementById('output')
      );
    }

    return (
      <div className="App">
        <h1>Welcome to BigchainDB</h1>
        <button id="button" onClick={create}>Execute me!</button>
        <div id="output"></div>
      </div>
    );

  }
}

export default App;
