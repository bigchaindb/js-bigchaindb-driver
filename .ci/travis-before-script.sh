#!/bin/bash

set -e -x

rethinkdb --daemon
export BIGCHAINDB_KEYPAIR_PUBLIC=GW1nrdZm4mbVC8ePeiGWz6DqHexqewqy5teURVHi3RG4
export BIGCHAINDB_KEYPAIR_PRIVATE=2kQgBtQnHoauw8QchKM7xYvEBW1QDoHzhBsCL9Vi1AzB

# Start BigchainDB in the background and ignore any output
bigchaindb start >/dev/null 2>&1 &
