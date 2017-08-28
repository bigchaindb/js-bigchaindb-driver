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

Getting Started
---------------
We begin by creating an object of BigchainDB driver:

.. code-block:: js

	// ES6 Browser
	import * as driver from 'js-bigchaindb-driver';
	// ES<<6 Browser
	let driver = require('js-bigchaindb-driver');
	// ES<<6 CommonJS / node
	let driver = require('js-bigchaindb-driver/dist/node');

Next, we define a constant containing the API path.

.. code-block:: js

	// http(s)://<bigchaindb-API-url>/ (e.g. http://localhost:9984/api/v1/)
	const API_PATH = 'http://localhost:9984/api/v1/';

Cryptographic Identities Generation
-----------------------------------
Alice and Bob are represented by public/private key pairs. The private key is
used to sign transactions, meanwhile the public key is used to verify that a
signed transaction was indeed signed by the one who claims to be the signee.

.. code-block:: js

	const alice = new driver.Ed25519Keypair();
	const bob = new driver.Ed25519Keypair();

Digital Asset Definition
------------------------

As an example, let’s consider the creation and transfer of a digital asset
that represents a bicycle:

.. code-block:: js

	bicycle = {
        'data': {
            'bicycle': {
                'serial_number': 'abcd1234',
                'manufacturer': 'bkfab',
            },
        },
    }

We'll suppose that the bike belongs to Alice, and that it eventually will be 
transferred to Bob.

In general, you are free to define any JSON object you which to store for the 
``'data'`` property

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
   	bicycle,
   	metadata,
    	[ driver.Transaction.makeOutput(
			driver.Transaction.makeEd25519Condition(alice.publicKey)
		)],
    	alice.publicKey
	);

The transaction now needs to be fulfilled by signing it with Alice’s 
private key:

.. code-block:: js

	const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey);

And sent over to a BigchainDB node:

.. code-block:: js

	driver.Connection.postTransaction(txCreateAliceSimpleSigned, API_PATH)

Notice the transaction ``id``:

.. code-block:: js

	txid = txCreateAliceSimpleSigned.id

To check the status of the transaction:

.. code-block:: js

	driver.Connection.getStatus(txCreateAliceSimpleSigned.id, API_PATH)

It is also possible to check the status every 0.5 seconds 
with use of the transaction ``id``:

.. code-block:: js

	return driver.Connection.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id, API_PATH)

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
    	txCreateAliceSimpleSigned,
      {price: '100 euro'},
		[ driver.Transaction.makeOutput(
			driver.Transaction.makeEd25519Condition(bob.publicKey)
		)], 
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

	return driver.Connection.postTransaction(txTransferBobSigned, API_PATH)

Bob is the new owner:

.. code-block:: js

	

Alice is the former owner:

.. code-block:: js

	code




Recap: Asset Creation & Transfer
--------------------------------

.. code-block:: js

	

Other examples
--------------




TODO:
- Add lexer: https://stackoverflow.com/questions/4259105/which-sphinx-code-block-language-to-use-for-json