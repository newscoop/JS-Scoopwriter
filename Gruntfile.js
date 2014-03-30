'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-config')(grunt, {
    data: {
      source: require('./bower.json').appPath || 'app',
      dist: 'dist',
      plugin: 'plugin'
    }
  });
};