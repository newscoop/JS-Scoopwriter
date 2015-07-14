#!/bin/bash

set -e

if [ $ENV = "test" ]; then
  if [ "$BROWSER_PROVIDER" == "browserstack" ]; then
    BROWSERS="bs_Chrome,bs_Firefox"
  else
    BROWSERS="sl_Chrome,sl_Firefox"
  fi
  grunt travis --browsers $BROWSERS
  grunt jshint
else
  echo "Unknown env type. Please set ENV=test"
fi