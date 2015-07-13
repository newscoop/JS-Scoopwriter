#!/bin/bash

set -e

if [ $ENV = "test" ]; then
  grunt travis
  grunt jshint
else
  echo "Unknown env type. Please set ENV=test"
fi