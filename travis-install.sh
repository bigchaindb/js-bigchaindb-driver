#!/bin/bash

set -e -x

pip install --upgrade pip
pip install --upgrade tox

if [ "${TOXENV}" == "py35" ]; then
    sudo apt-get install rethinkdb
    pip install bigchaindb~=0.8
    pip install --upgrade codecov
fi
