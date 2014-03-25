'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  require('load-grunt-config')(grunt, {
    data: {
      source: require('./bower.json').appPath || 'app',
      dist: 'dist'
    }
  });

  // grunt.registerTask('server', function (target) {
  //   if (target === 'dist') {
  //     return grunt.task.run(['build', 'connect:dist:keepalive']);
  //   }

  //   grunt.task.run([
  //     'clean:server',
  //     'concurrent:server',
  //     'autoprefixer',
  //     'connect:livereload',
  //     'open',
  //     'watch'
  //   ]);
  // });
};