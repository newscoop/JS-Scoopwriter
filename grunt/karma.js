module.exports = {
    unit: {
        configFile: 'karma.conf.js',
        singleRun: true
    },
    travis: {
    	configFile: 'karma.conf.js',
	    singleRun: true,
        reporters: ['coverage'],
        port: 8081,
        coverageReporter: {
	        type: "lcov",
	        dir: "coverage/"
	    },

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
};