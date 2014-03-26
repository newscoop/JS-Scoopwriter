module.exports = {
  options : {
    html: true,         // html files parsing?
    js: true,           // javascript files parsing?
    css: true,          // css files parsing?
    clean: true,        // removes devcode comments even if code was not removed
    block: {
      open: 'devcode',  // with this string we open a block of code
      close: 'endcode'  // with this string we close a block of code
    },
    dest: '<%= dist %>' // default destination which overwrittes environment variable
  },

  server : {            // settings for task used with 'devcode:server'
    options: {
        source: '<%= source %>/',
        dest: '.tmp/',
        env: 'development'
    }
  },

  dist : {              // settings for task used with 'devcode:dist'
    options: {
        source: '<%= source %>/',
        dest: '<%= dist %>/',
        env: 'dist'
    }
  },

  newscoop : {          // settings for task used with 'devcode:newscoop'
    options: {
        source: '<%= dist %>/',
        dest: '<%= dist %>/',
        env: 'newscoop'
    }
  }
};