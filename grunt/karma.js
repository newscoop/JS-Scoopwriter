module.exports = {
	options: {
	    configFile: 'karma.conf.js',
	    singleRun: true
	    client: {
	      args: ['test']
	    }
	  },
    unit: {},
    travis: {
        reporters: ['coverage'],
        port: 8081,
        coverageReporter: {
	        type: "lcov",
	        dir: "coverage/"
	    },

	    customLaunchers: {
	      'sl_Chrome': {
	        base: 'SauceLabs',
	        browserName: 'chrome',
	        version: '41'
	      },
	      'sl_Firefox': {
	        base: 'SauceLabs',
	        browserName: 'firefox',
	        version: '38'
	      },
	      'bs_Chrome': {
	        base: 'BrowserStack',
	        browser: 'chrome',
	        os: 'OS X',
	        os_version: 'Yosemite'
	      },
	      'bs_Firefox': {
	        base: 'BrowserStack',
	        browser: 'firefox',
	        os: 'Windows',
	        os_version: '8'
	      }
	    },
	    browsers: ["bs_Chrome", "bs_Firefox"],
    },
};