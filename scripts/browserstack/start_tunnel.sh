#!/bin/bash

set -e

if [ "$BROWSER_PROVIDER" == "browserstack" ]; then
	node ./scripts/browserstack/start_tunnel.js &
fi