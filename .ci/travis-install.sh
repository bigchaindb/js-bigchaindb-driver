#!/bin/bash

set -e -x

pip install --upgrade pip
pip install --upgrade tox

sudo apt-get install rethinkdb
pip install bigchaindb==0.9.1
pip install --upgrade codecov
