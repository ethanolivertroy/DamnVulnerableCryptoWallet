#!/bin/sh

# Run ganache-cli 
sh -c 'truffle compile'
sleep 6
sh -c 'truffle migrate'
sleep 6
sh -c 'truffle exec migrations/extended-migrations.js'

python -m SimpleHTTPServer
