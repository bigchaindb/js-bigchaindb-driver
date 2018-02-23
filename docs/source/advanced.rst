=================
Advanced Examples
=================

Crypto Conditions
-----------------

Let's start with a basic use case example. Alice bought a bicycle for €240.
She will use the bike for a year and will give it to her daughter afterwards.
First, we create an asset registering the bicycle:

.. code-block:: js

    const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
        {'asset': 'bicycle'},
        {'purchase_price': '€240'},
        [
            driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey))
        ],
        alice.publicKey
    )

    const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)

After a year, she decides it's time to transfer the bicycle to her daughter Carly.
However, Alice wants to maintain the right over the bike so she can possibly sell it. If she would transfer the bicycle to Carly, she won't be able to do this.
So, Alice needs a crypto conditions that defines that she or her daughter can sign the ``TRANSFER`` transaction to a possible buyer.

We need to define a threshold as well. This defines how many persons have to sign the transaction to ``TRANSFER`` it.
In this case, we define two subconditions with the public keys from Alice and Carly. Next, we set the threshold to **one**.
This means that just one of the subconditions has to sign the transaction to transfer it.
This can be the mother Alice, or Carly herself.

.. code-block:: js

    // Create condition for Alice and Carly
    let subConditionFrom = driver.Transaction.makeEd25519Condition(alice.publicKey, false)
    let subConditionTo = driver.Transaction.makeEd25519Condition(carly.publicKey, false)

    // Create condition object with threshold and subconditions
    let condition = driver.Transaction.makeThresholdCondition(1, [subConditionFrom, subConditionTo])

    // Generate output with condition added
    let output = driver.Transaction.makeOutput(condition)

    // Add Carly to the output.public_keys field so she is the owner
    output.public_keys = [carly.publicKey]

    let transaction = driver.Transaction.makeTransferTransaction(
  		[{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
      [output],
  		{'meta': 'Transfer to new user with conditions'}
  	);

    // Add alice as previous owner
    transaction.inputs[0].owners_before = [alice.publicKey]

    // Because the addition of crypto conditions, the id for the transaction has to be regenerated
    delete transaction.id
    transaction.id = sha3.sha3_256
        .create()
        .update(driver.Transaction.serializeTransactionIntoCanonicalString(transaction))
        .hex()

    // Alice has to sign this transfer because she is still the owner of the created asset
    let signedCryptoConditionTx = driver.Transaction.signTransaction(transaction, alice.privateKey)

As you can see, we need to generate a new transactionId because we have added crypto conditions.
We do this with the js-sha3 package, you need to install this package through ``npm``:

``npm install --save js-sha3``

Don't forget to import the package in your code:

.. code-block:: js

    import * as sha3 from 'js-sha3'


If you would like to see a more complex example, please have a look [here](https://github.com/bigchaindb/project-jannowitz/blob/code-examples/js-examples/crypto-conditions.js)

.. TODO: Document Utils when finished
