'use strict';

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 2,
    browserNoActivityTimeout: 60000,

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/lodash/dist/lodash.min.js',
      'app/bower_components/jquery/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-strap/dist/modules/dimensions.min.js',
      'app/bower_components/angular-strap/dist/modules/tooltip.min.js',
      'app/bower_components/angular-strap/dist/modules/popover.min.js',
      'app/bower_components/angular-strap/dist/modules/button.min.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'app/bower_components/ng-file-upload/angular-file-upload.js',
      'app/bower_components/select2/select2.js',
      'app/bower_components/angular-ui-select2/src/select2.js',
      'app/bower_components/gc-angular-toaster/toaster.js',
      'app/scripts/*.js',
      'app/scripts/services/*.js',
      'app/scripts/controllers/*.js',
      'app/scripts/directives/*.js',
      'app/scripts/filters/*.js',
      'app/scripts/routing/router.js',
      'app/scripts/routing/fos_js_routes.js',
      'test/globals.js',
      'test/spec/**/*.js',
      'app/bower_components/ng-aloha-editor/libs/alohaeditor-0.26.4/aloha/lib/require.js',
      'app/bower_components/ng-aloha-editor/libs/alohaeditor-0.26.4/aloha/lib/vendor/jquery-1.7.2.js',
      'test/configure.js',
      'app/bower_components/ng-aloha-editor/ng-aloha-editor.js',
      'app/bower_components/ng-aloha-editor/libs/alohaeditor-0.26.4/aloha/lib/aloha-full.js',
      'app/bower_components/bootstrap/dist/js/bootstrap.js',
      'app/bower_components/xregexp/min/xregexp-all-min.js',
      'app/bower_components/ng-tags-input/ng-tags-input.js',
      'app/bower_components/angular-symfony-translation/dist/angular-symfony-translation.js',
      //include the directory where directive templates are stored
      'app/views/*.html'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // BrowserStack config for local development.
    browserStack: {
      project: 'JS-Scoopwriter',
      name: 'Scoopwriter tests',
      timeout: 600,
    },

    sauceLabs: {
      testName: 'Scoopwriter tests',
      startConnect: true
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome', 'Firefox'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    preprocessors: {
        // generate js files from html templates to expose them during
        // testing. necessary in order to test directives with template
        // URL
        'app/views/*.html': 'html2js',
        // change the following in order to change which files are
        // included in the coverage reports. refer to
        // http://karma-runner.github.io/0.8/config/coverage.html
        'app/scripts/controllers/*.js': 'coverage',
        'app/scripts/directives/*.js': 'coverage',
        'app/scripts/filters/*.js': 'coverage',
        'app/scripts/services/*.js': 'coverage'
    }
    /* uncomment the following to get coverage reports *
    ,
    reporters: ['coverage']
    /**/
  });

  if (process.env.TRAVIS) {
    if (process.env.BROWSER_PROVIDER === 'saucelabs' && !process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
      console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
      process.exit(1);
    }

    config.browserNoActivityTimeout = 180000;

    var buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
    config.logLevel = config.LOG_DEBUG;

    //BrowserStack
    config.browserStack.build = buildLabel;
    config.browserStack.startTunnel = true;
    config.browserStack.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;

    //SouceLabs
    config.sauceLabs.build = buildLabel;
    config.sauceLabs.startConnect = true;
    config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
    config.sauceLabs.recordScreenshots = true;

    if (process.env.BROWSER_PROVIDER === 'saucelabs') {
      config.captureTimeout = 0;
    }
  };
};
