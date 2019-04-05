#!/bin/bash

port=8545
mnemonic='candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
db=./bchain/prod

# Run ganache-cli
ganache-cli --port $port --mnemonic "$mnemonic" --db "$db"
