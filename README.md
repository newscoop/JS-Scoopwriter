# About
This project is at the moment mainly targeted at `Newscoop` which is an open source CMS for news by Sourcefabric. However it should be flexible enough to be used for other projects too.

# Getting started
## Dependencies
* `node` - http://nodejs.org/download/ (follow instruction for your specific platform) 
* `npm` - comes with node now
* `grunt` - npm install -g grunt-cli
* `bower` - npm install -g bower

## Setup
In order to run this you need all the dependencies listed above. Checkout the repo,
then install the dependencies:

    $ git clone <repo address>
    $ cd aes/
    $ npm install .
    $ bower install

## Standalone with mocked backend
For the standalone demo there is a Mocked Backend included (also used for E2E). You will need `grunt` for this to work.

	$ grunt server
	

## Building the Project
If you want to create a build of the project it's as simple as taking `grunt` and doing a build. This will include, minimize etc all the required assets.

	$ grunt build
	
The resulting build files end up in the `dist/` directory.
Inside the `dist/` dir you can now run a local server like `serve` (available from `npm`, package `node-serve`) to test.

	$ cd dist/
	$ serve

## Creating new angular entities

Until now, we created new entities using yeoman:

    $ yo angular:service my-awesome-servire

Note that the name has to be separated by hyphens, and yeoman will
convert it to camel case. Note also that yeoman will create services
starting with an uppercase letter like `MyAwesomeService`, but this is
wrong: services are singletons so a name like `myAwesomeService` is
closer to javascript good practices, that say to call just class names
uppercase. Controllers, on the other hand, should have uppercase names
since any instance will be generated on its own and will be
independent.

# Tests
## Unit Tests

Unit tests depend on `karma`

	$ grunt test

## E2E Tests

Integration tests depend on `protractor` and `selenium`. Run them using:

    $ protractor protractorConf.js

Be sure to have the application served where the tests will try to
connect (at the current moment `127.0.0.1:9000`), for example running:

    $ grunt server

## Coverage report

In order to get coverage reports, uncomment the `reporters` section in
the karma conf file. It is better to keep coverage disabled if some
tests are failing, and enable it just if all the tests succeed. When
coverage is enabled, no details about failing tests are shown.

After running the tests, coverage reports are produced in the
`coverage` folder. In order to read them, fire your browser to one of
the index files, for example with Mac OSX:

    $ open "coverage/Chrome 33.0.1750 (Mac OS X 10.9.2)/index.html"

In order to change the way coverage is generated, act on the karma
conf file

# Compatibility table

The following features restrict the application usage to the related
browsers

Feature       | Explorer | Android Browser | iOS Safari |
---           | ---      | ---             | ---        |
File API      | 10       | 4.4             | 6.1        |
Drag and Drop | 10       | no              | no         |

Final support restrictions:
- Explorer 10
- no Android Browser
- no iOS Safari
