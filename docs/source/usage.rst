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

It is also possible to connect to a node of the BigchainDB test network.
To do so, you need to pass the **app_id and app_key**.

.. code-block:: js

	let conn = new driver.Connection('https://test.bigchaindb.com/api/v1/', {
		app_id: 'Get one from testnet.bigchaindb.com',
		app_key: 'Get one from testnet.bigchaindb.com'
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

	conn.postTransactionCommit(txCreateAliceSimpleSigned)

Notice the transaction ``id``:

.. code-block:: js

	txid = txCreateAliceSimpleSigned.id

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
		// signedTx to transfer and output index
		[{ tx: txCreateAliceSimpleSigned, output_index: 0 }],

		[driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],

		// metadata
		{price: '100 euro'}
	);

The function ``makeTransferTransaction()`` needs following parameters:

- Unspent outputs: Array of `unspent transactions outputs`. Each item contains `Transaction` itself and index of `unspent output` for that `Transaction`.
- Array of output objects to add to the transaction: Think of these as the recipients of the asset after the transaction. For `TRANSFER` transactions, this should usually just be a list of outputs wrapping Ed25519 conditions generated from the public keys of the recipients.
- Metadata for transaction (e.g. price of sold bike)

Fulfill transaction by signing it with Alice's private key.

.. code-block:: js

	driver.Transaction.signTransaction(txTransferBob, alice.privateKey);

And sent over to a BigchainDB node:

.. code-block:: js

	conn.postTransactionCommit(txTransferBobSigned)

Check the status again:


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

BigchainDB also allows you to query for metadata, but there are some differences. The response of the text search call, beside retrieving the asset or metadata in each case, it consist of:
 - In the assets search the call returns the asset id which is the same id of the transaction that created the asset.
 - In the metadata search the call returns the transaction id that contains this metadata.

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


This call returns all the assets that match the string 'Bicycle Inc.', sorted by text score, as well as the asset id.


Querying for Metadata
-------------------

Similar as querying for assets, in BigchainDB you can query for metadata using simple text search.
This search is applied to all the strings inside the metadata payload and returns all the metadata payloads that match a given text search string.

Having 3 metadata objets that look like this:

.. code-block:: js

	metadata = [
	   {'state': {'price': 145, 'eur/us': '1.32'}},
	   {'state': {'price': 236, 'eur/us': '1.15'}},
	   {'state': {'price': 102, 'eur/us': '1.32'}},
	]

Let’s perform a text search for all metadata that contains the word '1.32':

.. code-block:: js

	conn.searchMetadata('1.32')
    		.then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets))

Which leads to following result:

.. code-block:: js

	[
	   {
		'metadata': {'state': {'price': 145, 'eur/us': '1.32'}},
		'id': '14045a0e27ea971f8ac88762d2d74518d3a21f3f0fcd9d8a9a3b644b689cf3eb'
	   },
	   {
		'metadata': {'state': {'price': 102, 'eur/us': '1.32'}},
		'id': '6dd91f4700b3f66c55c50be009018e96f026d37f565d042d1aedfb322623d17d'
	   }
	]


This call returns all the metadata objects that match the string '1.32', sorted by text score, as well as the transaction id corresponding to each metadata object.



Recap: Asset Creation & Transfer
--------------------------------

.. code-block:: js

	const driver = require('bigchaindb-driver')

	// BigchainDB server instance or testnetwork (e.g. https://test.bigchaindb.com/api/v1/)
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

	conn.postTransactionCommit(txCreateAliceSimpleSigned)
		.then(retrievedTx => console.log('Transaction', retrievedTx.id, 'successfully posted.'))
		// With the postTransactionCommit if the response is correct, then the transaction
		// is valid and commited to a block

		// Transfer bicycle to Bob
		.then(() => {
			const txTransferBob = driver.Transaction.makeTransferTransaction(
				// signedTx to transfer and output index
				[{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
				[driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
				// metadata
				{price: '100 euro'}
			)

			// Sign with alice's private key
			let txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)
			console.log('Posting signed transaction: ', txTransferBobSigned)

			// Post with commit so transaction is validated and included in a block
			return conn.postTransactionCommit(txTransferBobSigned)
		})
		.then(tx => {
			console.log('Response from BDB server:', tx)
			console.log('Is Bob the owner?', tx['outputs'][0]['public_keys'][0] == bob.publicKey)
			console.log('Was Alice the previous owner?', tx['inputs'][0]['owners_before'][0] == alice.publicKey )
		})
		// Search for asset based on the serial number of the bicycle
		.then(() => conn.searchAssets('Bicycle Inc.'))
		.then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets))


Ed25519Keypair Seed Functionality
---------------------------------

BigchainDB JavaScript driver allows you to create a keypair based on a seed.
The constructor accepts a 32 byte seed. One of the ways to create a seed from
a string (e.g. a passphrase) is the one used by ``bip39``, specifically the function ``mnemonicToSeed``.

Install bip39 with npm: ``npm install bip39``

Next, require ``bip39`` in your file like this: ``var bip39 = require('bip39')``

At last, we can create the keypair based on a string. The function will transform the string to a byte array.
As our constructor ``Ed25519Keypair()`` only accepts a seed of 32 bytes, we slice the first 32 bytes: ``slice(0,32)``.

.. code-block:: js

	var keypair = new driver.Ed25519Keypair(bip39.mnemonicToSeed("yourString").slice(0, 32))

You can use the ``Ed25519Keypair()`` constructor as well without seed.

.. code-block:: js

	var keypair = new driver.Ed25519Keypair()



Websocket Event Stream API Usage
--------------------------------

The Event Stream API enables new ways to interact with BigchainDB, making it possible for your application to subscribe to all newly–confirmed transactions that are happening in the system.
Below piece of code can be opened in your web browser. It will connect to your websocket (if you are using the testnet, redefine ``var wsUri ='wss://test.bigchaindb.com:443/api/v1/streams/valid_transactions'``). This web page will display all validated transactions.

.. code-block:: html

	<!DOCTYPE html>
	<meta charset="utf-8" />
	<title>WebSocket BigchainDB</title>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">

	<!-- jQuery library -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

	<!-- Latest compiled JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

	<!-- Websocket Script -->
	<script language="javascript" type="text/javascript">

	var wsUri = "ws://localhost:9985/api/v1/streams/valid_transactions";
	var output;
	var alertbox;

	function init()
	{
		output = document.getElementById("output");
		alertbox = document.getElementById("alert-box");
		setWebSocket();
	}

	function setWebSocket()
	{
		websocket = new WebSocket(wsUri);
		websocket.onopen = function(evt) { onOpen(evt) };
		websocket.onclose = function(evt) { onClose(evt) };
		websocket.onmessage = function(evt) { onMessage(evt) };
		websocket.onerror = function(evt) { onError(evt) };
	}

	function onOpen(evt)
	{
		writeAlertMessage("CONNECTED");
	}

	function onClose(evt)
	{
		writeAlertMessage("DISCONNECTED");
	}

	function onMessage(evt)
	{
		writeToScreen('<a href="#" class="list-group-item"><h4 class="list-group-item-heading">Valid Transaction</h4><p class="list-group-item-text">' + evt.data + '</p></a>');
	}

	function onError(evt)
	{
		writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
	}

	function closeConnection(evt)
	{
		websocket.close()
	}

	function writeToScreen(message)
	{
		var pre = document.createElement("p");
		pre.style.wordWrap = "break-word";
		pre.innerHTML = message;
		output.appendChild(pre);
	}

	function writeAlertMessage(message)
	{
		var alert = document.createElement("div");
		alert.className = "alert alert-success";
		alert.setAttribute("role", "alert");
		alert.innerHTML = message;
		alertbox.appendChild(alert);
	}

	/* Initialize websocket and attach all events */
	window.addEventListener("load", init, false);

	/* Event called on closing browser or refreshing page to close connection */
	window.addEventListener("beforeunload", closeConnection, false);

	</script>

	<!-- HTML Template -->
	<div class="container">
		<h2>WebSocket API Stream Valid Transactions BigchainDB</h2>

		<!-- Box for displaying all alerts -->
		<div id="alert-box"></div>

		<!-- Div for attachting all outputs -->
		<div id="output" class="list-group"></div>
	</div>


Besides that, a NodeJs version has been created to display the validated transactions.
All transactions are printed to the console. To use this piece of code, you will need the ``ws`` (WebSocket package) through npm: ``npm install --save ws``.

.. code-block:: js

	const WebSocket = require('ws')

	const ws = new WebSocket('ws://localhost:9985/api/v1/streams/valid_transactions')

	ws.on('open', () => {
		console.log("CONNECTED")
	});

	ws.on('message', (data) => {
		let json = JSON.parse(data)
		console.log("\nTransactionId: ", json.transaction_id)
		console.log("AssetId: ", json.asset_id)
		console.log("BlockId: ", json.block_id)
	});


Difference unspent and spent output
-----------------------------------
An unspent output is simply an output of a transaction which isn't yet an input of another transaction.
So, if we transfer an asset, the output becomes spent, because it becomes the input of the transfer transaction.
The transfer transactions its output becomes unspent now until he transfers the asset again to somebody else.

We will demonstrate this with a piece of code where we transfer a bicycle from Alice to Bob,
and further we transfer it from Bob to Chris. Expectations:

* Output for Alice is spent
* Output for Bob is spent
* Output for Chris is unspent (he is the last person in transaction chain)

.. code-block:: js

	const driver = require('bigchaindb-driver')
	const API_PATH = 'http://localhost:9984/api/v1/'
	const conn = new driver.Connection(API_PATH)

	const alice = new driver.Ed25519Keypair()
	const bob = new driver.Ed25519Keypair()
	const chris = new driver.Ed25519Keypair()

	console.log('Alice: ', alice.publicKey)
	console.log('Bob: ', bob.publicKey)
	console.log('Chris: ', chris.publicKey)

	// Define the asset to store, in this example
	// we store a bicycle with its serial number and manufacturer
	assetdata = {
		'bicycle': {
			'serial_number': 'cde',
			'manufacturer': 'Bicycle Inc.',
		}
	}

	var txTransferBobSigned;

	// Construct a transaction payload
	const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
		assetdata,
		{'meta': 'meta'},
		// A transaction needs an output
		[ driver.Transaction.makeOutput(
				driver.Transaction.makeEd25519Condition(alice.publicKey))
		],
		alice.publicKey
	)

	// Sign the transaction with private keys of Alice to fulfill it
	const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)
	console.log('\n\nPosting signed create transaction for Alice:\n', txCreateAliceSimpleSigned)

	conn.postTransactionCommit(txCreateAliceSimpleSigned)

		// Transfer bicycle from Alice to Bob
		.then(() => {
			const txTransferBob = driver.Transaction.makeTransferTransaction(
				[{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
				[driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
				{'newOwner': 'Bob'}
			)

			// Sign with alice's private key
			txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)
			console.log('\n\nPosting signed transaction to Bob:\n', txTransferBobSigned)

			// Post with commit so transaction is validated and included in a block
			return conn.postTransactionCommit(txTransferBobSigned)
		})

		// Second transfer of bicycle from Bob to Chris
		.then(tx => {
			const txTransferChris = driver.Transaction.makeTransferTransaction(
				[{ tx: txTransferBobSigned, output_index: 0 }],
				[driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(chris.publicKey))],
				{'newOwner': 'Chris'}
			)

			// Sign with bob's private key
			let txTransferChrisSigned = driver.Transaction.signTransaction(txTransferChris, bob.privateKey)
			console.log('\n\nPosting signed transaction to Chris:\n', txTransferChrisSigned)

			// Post with commit so transaction is validated and included in a block
			return conn.postTransactionCommit(txTransferChrisSigned)
		})
		.then(() => conn.listOutputs(alice.publicKey, true))
		.then(listSpentOutputs => {
			console.log("\nSpent outputs for Alice: ", listSpentOutputs.length) // Spent outputs: 1
			return conn.listOutputs(alice.publicKey, false)
		})
		.then(listUnspentOutputs => {
			console.log("Unspent outputs for Alice: ", listUnspentOutputs.length) // Unspent outputs: 0
			return conn.listOutputs(bob.publicKey, true)
		})
		.then(listSpentOutputs => {
			console.log("\nSpent outputs for Bob: ", listSpentOutputs.length) // Spent outputs: 1
			return conn.listOutputs(bob.publicKey, false)
		})
		.then(listUnspentOutputs => {
			console.log("Unspent outputs for Bob: ", listUnspentOutputs.length) // Unspent outputs: 0
			return conn.listOutputs(chris.publicKey, true)
		})
		.then(listSpentOutputs => {
			console.log("\nSpent outputs for Chris: ", listSpentOutputs.length) // Spent outputs: 0
			return conn.listOutputs(chris.publicKey, false)
		})
		.then(listUnspentOutputs => {
			console.log("Unspent outputs for Chris: ", listUnspentOutputs.length) // Unspent outputs: 1
		})
		.catch(res => {console.log(res)})

Output of above code looks like this. As you can see, Chris has no spent output, but one unspent output.

.. code-block:: js

	Spent outputs for Alice:  1
	Unspent outputs for Alice:  0

	Spent outputs for Bob:  1
	Unspent outputs for Bob:  0

	Spent outputs for Chris:  0
	Unspent outputs for Chris:  1

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
		[{ tx: txCreateAliceDivisibleSigned, output_index: 0 }],
		[
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(carly.publicKey), '2'),
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey), '1'),
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey), '1')
		],
		{
			metaDataMessage: 'I am specific to this transfer transaction'
		}
	);

To make the use of the last parameter of ``makeTransferTransaction()`` function more clear, we will do another transfer.
We will fulfill the first and second output of the create transaction (0, 1) because Carly and Bob decide to redistribute some money.

* Output 0 represents 2 tokens for Carly
* Output 1 represents 1 token for Bob

This gives us 3 tokens to redistribute. I want to give 1 token to Carly and 2 tokens Alice.

.. code-block:: js
	const txTransferDivisibleInputs = driver.Transaction.makeTransferTransaction(
		[{ tx: txTransferDivisibleSigned, output_index: 0 }, { tx: txTransferDivisibleSigned, output_index: 1 }],
		[
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(carly.publicKey), '1'),
			driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey), '2')
		],
		{
			metaDataMessage: 'I am specific to this transfer transaction'
		}
	);

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
