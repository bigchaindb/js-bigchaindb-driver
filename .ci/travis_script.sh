#!/bin/bash

set -e -x

docker-compose run --rm js-bigchaindb-driver yarn test
