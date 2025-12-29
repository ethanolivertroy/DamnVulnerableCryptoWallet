#!/bin/bash

port=7545
mnemonic='candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
db=./bchain/prod

# Run ganache
ganache --port $port --mnemonic "$mnemonic" --database "$db"
