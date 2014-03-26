// Put files not handled in other tasks here
module.exports = {
  dist: {
    files: [{
      expand: true,
      dot: true,
      cwd: '<%= source %>',
      dest: '<%= dist %>',
      src: [
        '*.{ico,png,txt}',
        '.htaccess',
        'bower_components/**/*',
        'images/{,*/}*',
        'fonts/*'
      ]
    }, {
      expand: true,
      cwd: '.tmp/images',
      dest: '<%= dist %>/images',
      src: [
        'generated/*'
      ]
    }]
  },
  styles: {
    expand: true,
    cwd: '<%= source %>/styles',
    dest: '.tmp/styles/',
    src: '{,*/}*.css'
  }
}