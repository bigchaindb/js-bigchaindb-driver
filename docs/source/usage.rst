====================
Basic Usage Examples
====================

For the examples on this page, we assume you've :doc:`installed the bigchaindb_driver JavaScript package <quickstart>`,
and you have determined the BigchainDB Root URL (issue: move this to general docs)
of the node or cluster you want to connect to.

This example guides you through creating and transferring an asset.
We walk through the code explaining its use, some pieces are left out
because they have no real use (e.g. definition of global variable)
*Full working code* can be found at the bottom of this document.
The following code are just snippets.

Getting Started
---------------
We begin by importing the BigchainDB driver:

.. code-block:: js

	const driver = require('bigchaindb-driver')

Next, we define a constant containing the API path.

.. code-block:: js

	const API_PATH = 'http://localhost:9984/api/v1/'

Create Connection With BigchainDB
---------------------------------

A simple connection with BigchainDB can be established like this.

.. code-block:: js

	const conn = new driver.Connection(API_PATH)

It is also possible to connect to a BigchainDB node of the IPDB test net.
To do so, you need to pass the **app_id and app_key**. 

.. code-block:: js 

	let bdb = new driver.Connection('https://test.ipdb.io/api/v1/', { 
		app_id: 'dgi829l9',
		app_key: 'u008ik1bf83b43ce3a95uu0727e66fb9'
	})

Cryptographic Identities Generation
-----------------------------------
Alice and Bob are represented by public/private key pairs. The private key is
used to sign transactions, meanwhile the public key is used to verify that a
signed transaction was indeed signed by the one who claims to be the signee.

.. code-block:: js

	const alice = new driver.Ed25519Keypair()
	const bob = new driver.Ed25519Keypair()

Digital Asset Definition
------------------------

As an example, let’s consider the creation and transfer of a digital asset
that represents a bicycle:

.. code-block:: js

	const assetdata = {
		'bicycle': {
			'serial_number': 'abcd1234',
			'manufacturer': 'Bicycle Inc.',
		}
	}

We'll suppose that the bike belongs to Alice, and that it eventually will be 
transferred to Bob.

In general, you are free to define any JSON object you which to store for the 
``'data'`` property (assetdata).

Metadata Definition (*optional*)
--------------------------------

You can `optionally` add metadata to a transaction. Any JSON object is accepted.

For example, the bicycle will be transferred on earth which is metadata:

.. code-block:: js

	const metadata = {'planet': 'earth'}

Asset Creation
--------------

We're now ready to create the digital asset. First, let's make a 'CREATE' 
transaction:

.. code-block:: js
	
	const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
   		assetdata,
   		metadata,

		// A transaction needs an output
		[ driver.Transaction.makeOutput(
			driver.Transaction.makeEd25519Condition(alice.publicKey))
		],
		alice.publicKey
	)

Transaction needs an array of Output objects.
Think of these as the recipients of the asset after the transaction.
For `CREATE` Transactions, this should usually just be a list of
Outputs wrapping Ed25519 Conditions generated from the issuers' public
keys (so that the issuers are the recipients of the created asset).

``alice.publicKey`` can be considered as the Input for the transaction. 
Each input spends/transfers a previous output by satisfying/fulfilling 
the crypto-conditions on that output. A CREATE transaction should have 
exactly one input. A TRANSFER transaction should have at least one input (i.e. ≥1). 

Sign the transaction with private key of Alice to fulfill it:

.. code-block:: js

	driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)

And sent over to a BigchainDB node:

.. code-block:: js

	conn.postTransaction(txCreateAliceSimpleSigned)

Notice the transaction ``id``:

.. code-block:: js

	txid = txCreateAliceSimpleSigned.id

To check the status of the transaction:

.. code-block:: js

	conn.getStatus(txCreateAliceSimpleSigned.id)

It is also possible to check the status every 0.5 seconds 
with use of the transaction ``id``:

.. code-block:: js

	conn.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id)

.. note:: It may take a small amount of time before a BigchainDB cluster
    confirms a transaction as being valid.

Asset Transfer
--------------

Imagine some time goes by, during which Alice is happy with her bicycle, and
one day, she meets Bob, who is interested in acquiring her bicycle. The timing
is good for Alice as she had been wanting to get a new bicycle.

To transfer the bicycle (asset) to Bob, Alice must consume the transaction's output in
which the Bicycle asset was created.

Alice could retrieve the transaction:

.. code-block:: js

	conn.getTransaction(txCreateAliceSimpleSigned.id)

First, let's prepare the transaction to be transferred. 

.. code-block:: js

	const txTransferBob = driver.Transaction.makeTransferTransaction(
		// signedTx to transfer
		txCreateAliceSimpleSigned,

		// metadata
		{price: '100 euro'},

		[driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))], 
		0
	);

The function ``makeTransferTransaction()`` needs following parameters:

- Unspent transaction: Previous transaction you have control over (i.e. can fulfill its Output Condition)
- Metadata for transaction (e.g. price of sold bike)
- Array of output objects to add to the transaction: Think of these as the recipients of the asset after the transaction. For `TRANSFER` transactions, this should usually just be a list of outputs wrapping Ed25519 conditions generated from the public keys of the recipients.
- Indices of the outputs in `unspent transaction` that this transaction fulfills.

Fulfill transaction by signing it with Alice's private key. 

.. code-block:: js

	driver.Transaction.signTransaction(txTransferBob, alice.privateKey);

And sent over to a BigchainDB node:

.. code-block:: js

	conn.postTransaction(txTransferBobSigned)

Check the status again:

.. code-block:: js

	conn.pollStatusAndFetchTransaction(txTransferBobSigned.id)

Bob is the new owner:

.. code-block:: js

	console.log('Is Bob the owner?', txTransferBobSigned['outputs'][0]['public_keys'][0] == bob.publicKey)
	// Output: true

Alice is the former owner:

.. code-block:: js

	console.log('Was Alice the previous owner?', txTransferBobSigned['inputs'][0]['owners_before'][0] == alice.publicKey )
	// Output: true


Querying for Assets
-------------------

BigchainDB allows you to query for assets using simple text search. This search is applied to all the strings inside the asset payload and returns all the assets that match a given text search string.

Let’s assume that we created 3 assets that look like this:

.. code-block:: js

	assets = [
	   {'data': {'bicycle': {'serial_number': 'abc', manufacturer: 'Bicycle Inc.'}}},
	   {'data': {'bicycle': {'serial_number': 'cde', manufacturer: 'Bicycle Inc.'}}},
	   {'data': {'bicycle': {'serial_number': 'fgh', manufacturer: 'Bicycle Inc.'}}}
	]

Let’s perform a text search for all assets that contain the word 'Bicycle Inc.':

.. code-block:: js

	conn.searchAssets('Bicycle Inc.')
    		.then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets))

Which leads to following result: 

.. code-block:: js 

	[
	   {
		'data': {'bicycle': {'serial_number': 'abc', manufacturer: 'Bicycle Inc.'}},
		'id': '7582d7a81652d0230fefb47dafc360ff09b2c2566b68f05c3a004d57e7fe7610'
	   },
	   {
		'data': {'bicycle': {'serial_number': 'cde', manufacturer: 'Bicycle Inc.'}},
		'id': 'e40f4b6ac70b9c1b3b237ec13f4174384fd4d54d36dfde25520171577c49caa4'
	   },
	   {
		'data': {'bicycle': {'serial_number': 'fgh', manufacturer: 'Bicycle Inc.'}},
		'id': '748f6c30daaf771c9020d84db9ad8ac4d1f7c8de7013db55e16f10ba090f7013'
	   }
	]


This call returns all the assets that match the string 'Bicycle Inc.', sorted by text score, as well as the asset id. This is the same id of the transaction that created the asset.



Recap: Asset Creation & Transfer
--------------------------------

.. code-block:: js

	const driver = require('bigchaindb-driver')

	// BigchainDB server instance or IPDB (e.g. https://test.ipdb.io/api/v1/)
	const API_PATH = 'http://localhost:9984/api/v1/'

	// Create a new keypair for Alice and Bob
	const alice = new driver.Ed25519Keypair()
	const bob = new driver.Ed25519Keypair()

	console.log('Alice: ', alice.publicKey)
	console.log('Bob: ', bob.publicKey)

	// Define the asset to store, in this example
	// we store a bicycle with its serial number and manufacturer
	const assetdata = {
		'bicycle': {
			'serial_number': 'cde',
			'manufacturer': 'Bicycle Inc.',
		}
	}

	// Metadata contains information about the transaction itself
	// (can be `null` if not needed)
	// E.g. the bicycle is fabricated on earth
	const metadata = {'planet': 'earth'}

	// Construct a transaction payload
	const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
		assetdata,
		metadata,

		// A transaction needs an output
		[ driver.Transaction.makeOutput(
				driver.Transaction.makeEd25519Condition(alice.publicKey))
		],
		alice.publicKey
	)

	// Sign the transaction with private keys of Alice to fulfill it
	const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)

	// Send the transaction off to BigchainDB
	const conn = new driver.Connection(API_PATH)

	conn.postTransaction(txCreateAliceSimpleSigned)
		// Check status of transaction every 0.5 seconds until fulfilled
		.then(() => conn.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id))
		.then(retrievedTx => console.log('Transaction', retrievedTx.id, 'successfully posted.'))
		// Check status after transaction has completed (result: { 'status': 'valid' })
		// If you check the status of a transaction to fast without polling,
		// It returns that the transaction is waiting in the 'backlog'
		.then(() => conn.getStatus(txCreateAliceSimpleSigned.id))
		.then(status => console.log('Retrieved status method 2: ', status))

		// Transfer bicycle to Bob
		.then(() => {
			const txTransferBob = driver.Transaction.makeTransferTransaction(
				// signedTx to transfer
				txCreateAliceSimpleSigned,
				// metadata
				{price: '100 euro'},
				[driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))], 
				0)
			
			// Sign with alice's private key
			let txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)
			console.log('Posting signed transaction: ', txTransferBobSigned)

			// Post and poll status
			return conn.postTransaction(txTransferBobSigned)
		})
		.then(res => {
			console.log('Response from BDB server:', res)
			return conn.pollStatusAndFetchTransaction(res.id)
		})
		.then(tx => {
			console.log('Is Bob the owner?', tx['outputs'][0]['public_keys'][0] == bob.publicKey)
			console.log('Was Alice the previous owner?', tx['inputs'][0]['owners_before'][0] == alice.publicKey )
		})
		// Search for asset based on the serial number of the bicycle
		.then(() => conn.searchAssets('Bicycle Inc.'))
		.then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets))

Divisible Assets
----------------

All assets in BigchainDB become implicitly divisible if a transaction contains more than one of that asset (we’ll see how this happens shortly).

Let's assume we have created a token to pay each other for small transactions like a beer or some food between friends.

.. code-block:: js

	const token = {
		'value': '1 euro'
	}

Let's create the asset. Note that we give an extra parameter to the ``makeOutput()`` function.
We give it the parameter ``'4'`` to indicate that we want to create 4 tokens. 
**Pay attention to give the function a String instead of a plain Number.**

.. code-block:: js

	const txCreateAliceDivisible = driver.Transaction.makeCreateTransaction(
		token,
		{metaDataMessage: 'I am specific to this create transaction'},
		[driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey), '4')],
		alice.publicKey
	)

Alice goes dining at Bob and Carly. She decides to give a small fee to Bob and Carly.
Alice decides to issue 4 tokens as a payment for her food: one to Bob, two to Carly and one to herself.
Why one to herself? If you decide to fulfill an output, you have to spend all tokens.
So if you want to keep one token for yourself, you have to transfer it to yourself.
As you can see, we fulfill the first output of the create transaction (it's 0 because we start counting from 0).
This gives us 4 tokens to transfer.

.. code-block:: js

	const txTransferDivisible = driver.Transaction.makeTransferTransaction(
		txCreateAliceDivisibleSigned,
		{
			metaDataMessage: 'I am specific to this transfer transaction'
		},
		[
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(carly.publicKey), '2'),
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey), '1'),
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey), '1')
		], 0);

To make the use of the last parameter of ``makeTransferTransaction()`` function more clear, we will do another transfer.
We will fulfill the first and second output of the create transaction (0, 1) because Carly and Bob decide to redistribute some money.

* Output 0 represents 2 tokens for Carly
* Output 1 represents 1 token for Bob 

This gives us 3 tokens to redistribute. I want to give 1 token to Carly and 2 tokens Alice.

.. code-block:: js

	const txTransferDivisibleInputs = driver.Transaction.makeTransferTransaction(
		txTransferDivisibleSigned,
		{
			metaDataMessage: 'I am specific to this transfer transaction'
		},
		[
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(carly.publicKey), '1'),
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey), '2')
		], 0, 1)

Because we want to fulfill two outputs (Carly and Bob), we have to sign the transfer transaction in the same order:

.. code-block:: js

	const txTransferDivisibleInputsSigned = driver.Transaction.signTransaction(
		txTransferDivisibleInputs,
		carly.privateKey, bob.privateKey)

Here is a better overview of the flow of the tokens.

+-----------+------------+-----------------+
| **Owner** | **Amount** | **Transaction** |
+===========+============+=================+
| ``Alice`` |   4        | ``CREATE``      |
+-----------+------------+-----------------+
| ``Alice`` |   1        | ``TRANSFER 1``  |
+-----------+------------+-----------------+
| ``Bob``   |   1        | ``TRANSFER 1``  |
+-----------+------------+-----------------+
| ``Carly`` |   2        | ``TRANSFER 1``  |
+-----------+------------+-----------------+
| ``Alice`` |   3        | ``TRANSFER 2``  |
+-----------+------------+-----------------+
| ``Bob``   |   0        | ``TRANSFER 2``  |
+-----------+------------+-----------------+
| ``Carly`` |   1        | ``TRANSFER 2``  |
+-----------+------------+-----------------+


.. TODO:
.. - Add lexer: https://stackoverflow.com/questions/4259105/which-sphinx-code-block-language-to-use-for-json
.. - Add divisible assets example
.. - Add more readable code with promises possibly.