#!/bin/bash

set -e -x

if [ "${TOXENV}" == "py35" ]; then
    rethinkdb --daemon
    bigchaindb -y configure

    # Start BigchainDB in the background and ignore any output
    bigchaindb start >/dev/null 2>&1 &
fi
