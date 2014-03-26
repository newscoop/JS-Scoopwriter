module.exports = {
  coffee: {
    files: ['<%= source %>/scripts/{,*/}*.coffee'],
    tasks: ['coffee:dist']
  },
  coffeeTest: {
    files: ['test/spec/{,*/}*.coffee'],
    tasks: ['coffee:test']
  },
  styles: {
    files: ['<%= source %>/styles/{,*/}*.css'],
    tasks: ['copy:styles', 'autoprefixer']
  },
  livereload: {
    options: {
      livereload: '<%= connect.options.livereload %>'
    },
    files: [
      '<%= source %>/{,*/}*.html',
      '.tmp/styles/{,*/}*.css',
      '{.tmp,<%= source %>}/scripts/{,*/}*.js',
      '<%= source %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
    ],
    tasks: ['devcode:server']
  }
}