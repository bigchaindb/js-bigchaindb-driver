BigchainDB JavaScript Driver
============================

.. image:: https://img.shields.io/npm/v/bigchaindb-driver.svg
			:target: https://www.npmjs.com/package/bigchaindb-driver

.. image:: https://codecov.io/gh/bigchaindb/js-bigchaindb-driver/branch/master/graph/badge.svg
			:target: https://codecov.io/gh/bigchaindb/js-bigchaindb-driver

.. image:: https://img.shields.io/badge/js-ascribe-39BA91.svg
			:target: https://github.com/ascribe/javascript

.. image:: https://travis-ci.org/bigchaindb/js-bigchaindb-driver.svg?branch=master
			:target: https://travis-ci.org/bigchaindb/js-bigchaindb-driver

.. image:: https://badges.greenkeeper.io/bigchaindb/js-bigchaindb-driver.svg
			:target: https://greenkeeper.io/

Features
--------

* Support for preparing, fulfilling, and sending transactions to a BigchainDB
  node.
* Retrieval of transactions by id.
* Getting status of a transaction by id.

Compatibility Matrix
--------------------

+-----------------------+----------------------------------+
| **BigchainDB Server** | **BigchainDB Javascript Driver** |
+=======================+==================================+
| ``0.10``              | ``0.1.x``                        |
+-----------------------+----------------------------------+
| ``1.0``               | ``0.3.x``                        |
+-----------------------+----------------------------------+
| ``1.3``               | ``3.x.x``                        |
+-----------------------+----------------------------------+


Older versions
--------------------
For versions below 3.2, a transfer transaction looked like:

.. code-block:: js

	const createTranfer = BigchainDB.Transaction.makeTransferTransaction(
	    txCreated,
	    metadata, [BigchainDB.Transaction.makeOutput(
	        BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))],
	    0
	)

	const signedTransfer = BigchainDB.Transaction.signTransaction(createTranfer,
		keypair.privateKey)


In order to upgrade and do it compatible with the new driver version, this
transaction should be now:

.. code-block:: js

	const createTranfer = BigchainDB.Transaction.makeTransferTransaction(
		[{ tx: txCreated, output_index: 0 }],
		[aliceOutput],
		metaData
	)

	const signedTransfer = BigchainDB.Transaction.signTransaction(createTranfer,
		keypair.privateKey)


The upgrade allows to create transfer transaction spending outputs that belong
to different transactions. So for instance is now possible to create a transfer 
transaction spending two outputs from two different create transactions:


.. code-block:: js

	const createTranfer = BigchainDB.Transaction.makeTransferTransaction(
		[{ tx: txCreated1, output_index: 0 },
			M{ tx: txCreated2, output_index: 0}],
		[aliceOutput],
		metaData
	)

	const signedTransfer = BigchainDB.Transaction.signTransaction(createTranfer,
		keypair.privateKey)
