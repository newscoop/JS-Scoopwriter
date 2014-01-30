# Run the demo

In order to run this you need `node.js` and `npm`. Checkout the repo,
then install the dependencies:

    $ git clone <repo address>
    $ cd aes/
    $ npm install .
    $ bower install .

You will need also other node scripts like `grunt`, `karma` or
`protractor` that are usually installed globally and thus not listed
among the dependencies.

Build the assets with `grunt` and then serve the `dist` directory with
any static server, for example `serve` installable with `npm` or
apache:

    $ grunt build
    $ cd dist/
    $ serve

# Run tests

Unit tests are run with `grunt test`. They depend on karma.

Integration tests are run with protractor:

    $ protractor protractorConf.js
