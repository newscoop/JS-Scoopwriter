#!/bin/bash

set -e

if [ "$BROWSER_PROVIDER" == "browserstack" ]; then
	#node ./scripts/browserstack/start_tunnel.js &
	wget http://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip
	unzip BrowserStackLocal-linux-x64.zip
	./BrowserStackLocal $BROWSER_STACK_ACCESS_KEY localhost,8001,0 &
fi