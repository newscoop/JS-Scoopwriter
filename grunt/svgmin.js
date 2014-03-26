module.exports = {
  dist: {
    files: [{
      expand: true,
      cwd: '<%= source %>/images',
      src: '{,*/}*.svg',
      dest: '<%= dist %>/images'
    }]
  }
}