#!/bin/bash

set -e -x

docker-compose up -d bigchaindb

npm install
gem install cowsay
npm install -g codecov