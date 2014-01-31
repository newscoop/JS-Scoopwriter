# About
This project is at the moment mainly targeted at `Newscoop` which is an open source CMS for news by Sourcefabric. However it should be flexible enough to be used for other projects too.

# Getting started
## Setup
In order to run this you need `node.js` and `npm`. Checkout the repo,
then install the dependencies:

    $ git clone <repo address>
    $ cd aes/
    $ npm install .
    $ bower install .

## Standalone with mocked backend
For the standalone demo there is a Mocked Backend included (also used for E2E). You will need `grunt` for this to work.

	$ grunt server
	

## Building the Project
If you want to create a build of the project it's as simple as taking `grunt` and doing a build. This will include, minimize etc all the required assets.

	$ grunt build
	
The resulting build files end up in the `dist/` directory.
Inside the `dist/` dir you can now run a local server like `serve` (available from `npm`) to test.

	$ cd dist/
	$ serve

# Tests
## Unit Tests

Unit tests depend on `karma`

	$ grunt test

## E2E Tests

Integration tests depend on `protractor` and `selenium`

    $ protractor protractorConf.js