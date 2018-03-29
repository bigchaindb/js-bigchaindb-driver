#!/bin/bash

set -e -x

docker-compose build --no-cache bigchaindb js-bigchaindb-driver
