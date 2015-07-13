module.exports = {
    unit: {
        configFile: 'karma.conf.js',
        singleRun: true
    },
    travis: {
    	configFile: 'karma.conf.js',
	    browsers: ["Firefox"],
	    singleRun: true,
        reporters: ['coverage'],
        port: 8081,
        coverageReporter: {
	        type: "lcov",
	        dir: "coverage/"
	    }
    },
};