====================
Basic Usage Examples
====================

For the examples on this page, we assume you've :doc:`installed the bigchaindb_driver JavaScript package <quickstart>`,
and you have determined the BigchainDB Root URL (issue: move this to general docs)
of the node or cluster you want to connect to.

This example guides you through creating and transferring an asset.
We walk through the code explaining its use, some pieces are left out
because they have no real use (e.g. defenition of global variable)
*Full working code* can be found at the bottom of this document.
The following code are just snippets.

Getting Started
---------------
We begin by creating an object of BigchainDB driver:

.. code-block:: js

	const driver = require('bigchaindb-driver')

Next, we define a constant containing the API path.

.. code-block:: js

	const API_PATH = 'http://localhost:9984/api/v1/'

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

	assetdata = {
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

	metadata = {'planet': 'earth'}

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

Sign the transaction with private key of Alice to fulfill it:

.. code-block:: js

	const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)

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

To transfer the bicycle (asset) to Bob, Alice must consume the transaction in
which the Bicycle asset was created.

Alice could retrieve the transaction:

.. code-block:: js

	driver.Connection.getTransaction(txCreateAliceSimpleSigned.id)

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

	txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey);

And sent over to a BigchainDB node:

.. code-block:: js

	conn.postTransaction(txTransferBobSigned, API_PATH)

Check the status again:

.. code-block:: js

	conn.pollStatusAndFetchTransaction(txTransferBobSigned.id)

Bob is the new owner:

.. code-block:: js

	console.log('Is Bob the owner?', tx['outputs'][0]['public_keys'][0] == bob.publicKey)
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

	let assets = conn.searchAssets('Bicycle Inc.')
    		.then((assets) => console.log('Found assets with serial number Bicycle Inc.:', assets))

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
	assetdata = {
		'bicycle': {
			'serial_number': 'cde',
			'manufacturer': 'Bicycle Inc.',
		}
	}

	// Metadata contains information about the transaction itself
	// (can be `null` if not needed)
	// E.g. the bicycle is fabricated on earth
	metadata = {'planet': 'earth'}

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
			txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)
			console.log('Posting signed transaction: ', txTransferBobSigned)

			// Post and poll status
			return conn.postTransaction(txTransferBobSigned, API_PATH)
		})
		.then((res) => {
			console.log('Response from BDB server:', res)
			return conn.pollStatusAndFetchTransaction(txTransferBobSigned.id)
		})
		.then((tx) => {
			console.log('Is Bob the owner?', tx['outputs'][0]['public_keys'][0] == bob.publicKey)
			console.log('Was Alice the previous owner?', txTransferBobSigned['inputs'][0]['owners_before'][0] == alice.publicKey )
		})
		.then(() => {
			// Search for asset based on the serial number of the bicycle
			let assets = conn.searchAssets('Bicycle Inc.')
				.then((assets) => console.log('Found assets with serial number Bicycle Inc.:', assets))
		})
		.then(() => {
			// Search for asset based on the serial number of the bicycle
			let assets = conn.searchAssets('Bicycle Inc.')
				.then((assets) => console.log('Found assets with serial number Bicycle Inc.:', assets))
		})



Divisible Assets
----------------


TODO:
- Add lexer: https://stackoverflow.com/questions/4259105/which-sphinx-code-block-language-to-use-for-json
- Add divisible assets example