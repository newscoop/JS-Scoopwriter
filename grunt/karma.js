module.exports = {
	options: {
	    configFile: 'karma.conf.js',
	    singleRun: true,
	    reporters: ['coverage'],
        port: 8080,
        coverageReporter: {
	        type: "lcov",
	        dir: "coverage/"
	    }
	  },
    unit: {},
    bs: {
	    customLaunchers: {
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
    sl: {
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
	      }
	    },
	    browsers: ["sl_Chrome", "sl_Firefox"],
    },
};