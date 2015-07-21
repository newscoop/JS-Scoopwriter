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
		    },
		    'SL_Chrome': {
	        base: 'SauceLabs',
	        browserName: 'chrome',
	        version: '39'
	      },
	      'SL_Firefox_30': {
	        base: 'SauceLabs',
	        browserName: 'firefox',
	        version: '30'
	      },
	      'SL_Safari': {
	        base: 'SauceLabs',
	        browserName: 'safari',
	        platform: 'OS X 10.10',
	        version: '8'
	      },
	      'SL_IE_10': {
	        base: 'SauceLabs',
	        browserName: 'internet explorer',
	        platform: 'Windows 7',
	        version: '10'
	      },
	      'SL_IE_11': {
	        base: 'SauceLabs',
	        browserName: 'internet explorer',
	        platform: 'Windows 8.1',
	        version: '11'
	      }
	    },
	    browsers: ["SL_Chrome", "SL_Firefox", "SL_Firefox_30", "SL_Safari", "SL_IE_10", "SL_IE_11"],
    },
};