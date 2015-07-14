module.exports = {
	options: {
	    configFile: 'karma.conf.js',
	    singleRun: true,
        port: 8080,
        coverageReporter: {
	        type: "lcov",
	        dir: "coverage/"
	    }
	  },
    unit: {},
    bs: {
    	reporters: ['coverage'],
	    customLaunchers: {
	      'BS_Chrome': {
	        base: 'BrowserStack',
	        browser: 'chrome',
	        os: 'OS X',
	        os_version: 'Yosemite'
	      },
	      'BS_Firefox': {
	        base: 'BrowserStack',
	        browser: 'firefox',
	        os: 'Windows',
	        os_version: '8'
	      }
	    },
	    browsers: ["BS_Chrome", "BS_Firefox"],
    },
    sl: {
    	reporters: ['coverage', 'saucelabs'],
	    customLaunchers: {
	      'SL_Chrome': {
		      base: 'SauceLabs',
		      browserName: 'chrome'
		    },
		    'SL_Firefox': {
		      base: 'SauceLabs',
		      browserName: 'firefox',
		    }
	    },
	    browsers: ["SL_Chrome", "SL_Firefox"],
    },
};