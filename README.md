# <a name="top"></a>About
AES is a new modern article edit screen for
[Newscoop](https://github.com/sourcefabric/Newscoop),
[Sourcefabric](www.sourcefabric.org)'s open source CMS for news. It is a single
page application written in AngularJS meant to be used as a Newscoop plugin.
Its aim is to provide a modern and responsive alternative to the existing
article edit screen, which is starting to show its age.

# Table of Contents

* [Getting Started](#gettingStarted)
* [Browser Compatibility](#compatibility)
* [How to Contribute](#contribute)
* [Things to Improve](#toImprove)

# <a name="gettingStarted"></a>Getting Started
## Setup
In order to run it you need to have `node.js` and `npm` installed on your
machine. Clone the repository and then install the dependencies:

    $ git clone <repo address>
    $ cd aes
    $ npm install .  # note the trailing dot
    $ bower install

NOTE: if you get a lot of `EACCES` errors, you might want to run the third
command with superuser privileges (e.g. by prefixing it with `sudo`).

TODO: configure the server (API)

## Run

To run the application, simply type the following in console (from inside
the directory you cloned the repository into):

    $ grunt server

You can now access the application by pointing your browser to
**localhost:9000**. To stop the server, press `<CTRL> + C` in the console
window where you started it.

## Test

Unit tests depend on the [karma](http://karma-runner.github.io/) test runner.
To run them, type the following in console:

    $ grunt test

By default it runs tests in Chrome and Firefox. If you don't have these
browsers installed or if you want to run tests in a different browser, change
the corresponding setting in the `karma.conf.js` file (the `browsers` option).

### Coverage Report
In order to get coverage reports, uncomment the
`reporters` section in the `karma.conf.js` file. All test must pass, otherwise
the reports will not be generated.

After running the tests, coverage reports are produced in the `coverage`
subdirectory located directly under the the application's root directory.
Reports are generated for every browser version the tests were run in, each
bundle in its own subdirectory.

To view the reports, open the `index.html` in one of these subdirectories, e.g.
for Firefox the path to it looks something similar to this:

`<aes_dir>/coverage/Firefox\ 34.0.0\ \(Ubuntu\)/index.html`

([Back to Top](#top))

# <a name="compatibility"></a>Browser Compatibility

TODO: to be tested, but it should work in any modern browser:

* Chrome x.y
* Firefox x.y
* Internet Explorer 10+
* Safari x.y
* ...

TODO: what about mobile browsers?

([Back to Top](#top))

# <a name="contribute"></a>How to Contribute

TODO: link to CONTRIBUTE.md

([Back to Top](#top))

# <a name="toImprove"></a>Things to Improve

TODO: ...

([Back to Top](#top))
