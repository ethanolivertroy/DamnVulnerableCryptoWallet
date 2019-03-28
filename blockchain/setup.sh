#!/bin/sh

# Run ganache-cli 
sh -c 'truffle migrate'
sleep 6
sh -c 'truffle exec scripts/extended-migrations.js'

python -m SimpleHTTPServer
