Installing latest master with pip
---------------------------------
In order to work with the latest BigchainDB (server) master branch:

.. code-block:: bash

    $ pip install --process-dependency-links git+https://github.com/bigchaindb/bigchaindb-driver.git

Point to some BigchainDB node, which is running BigchainDB server ``master``:

.. code-block:: python

    from bigchaindb_driver import BigchainDB 
    
    bdb = BigchainDB('http://here.be.dragons:9984') 
