import { Injectable } from '@angular/core';
import * as driver from '../../../../dist/node/index.js'
import bip39 from 'bip39'

@Injectable()
export class BdbService {

  public conn
  public createKeypair
  public aliceMnemonic
  public aliceKeypair

  constructor() {
    this.conn = new driver.Connection('http://localhost:9984/api/v1/')
    this.createKeypair = (seed) => new driver.Ed25519Keypair(seed.slice(0, 32))
    this.aliceMnemonic = bip39.generateMnemonic()
    this.aliceKeypair = this.createKeypair(bip39.mnemonicToSeed(this.aliceMnemonic))
  }

  create() {
    return new Promise((resolve: any, reject) => {
      const condition = driver.Transaction.makeEd25519Condition(this.aliceKeypair.publicKey, true)
      const output = driver.Transaction.makeOutput(condition)
      output.public_keys = [this.aliceKeypair.publicKey]
      const transaction = driver.Transaction.makeCreateTransaction(
        {asset:'data'},
        {metadata:'metadata'},
        [output],
        this.aliceKeypair.publicKey
      )
      const txSigned = driver.Transaction.signTransaction(transaction, this.aliceKeypair.privateKey)
      this.conn.postTransaction(txSigned)
        .then(() => this.conn.pollStatusAndFetchTransaction(txSigned.id))
        .then(retrievedTx => {
          resolve(retrievedTx)
        })
    });



  }

}
