#!/usr/bin/env bash

cd ../client && rm -rf build && npm run build
cd ../server && npm start

