#!/bin/bash

set -e

if [ $ENV = "test" ]; then
  if [ "$BROWSER_PROVIDER" == "browserstack" ]; then
    grunt travis-bs
  else
    grunt travis-sl
  fi
  grunt jshint
else
  echo "Unknown env type. Please set ENV=test"
fi