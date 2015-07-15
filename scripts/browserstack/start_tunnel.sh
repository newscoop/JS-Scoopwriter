#!/bin/bash

set -e

if [ "$BROWSER_PROVIDER" == "browserstack" ]; then
	export BROWSER_STACK_ACCESS_KEY=`echo $BROWSER_STACK_ACCESS_KEY | rev`

	node ./scripts/browserstack/start_tunnel.js &
fi