#!/bin/bash
set -e
set -u

npm install
grunt publish-npm
