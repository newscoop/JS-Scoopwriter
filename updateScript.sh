#!/bin/bash
git fetch upstream
git checkout .
git checkout upstream/master
npm install
bower install
grunt build
