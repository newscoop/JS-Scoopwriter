#!/bin/bash

set -e

if [ $ENV = "test" ]; then
  if [ "$BROWSER_PROVIDER" == "browserstack" ]; then
    grunt travis-bs
  else
    travis_start_sauce_connect
    grunt travis-sl
    travis_stop_sauce_connect
  fi
  grunt jshint
else
  echo "Unknown env type. Please set ENV=test"
fi