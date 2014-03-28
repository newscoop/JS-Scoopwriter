module.exports = {
    options: {
        html: true,
        js: true,
        css: true,
        clean: true,
        block: {
            open: 'devcode',
            close: 'endcode'
        },
        dest: '<%= dist %>'
    },
    server: {
        options: {
            source: '<%= source %>/',
            dest: '.tmp/',
            env: 'development'
        }
    },
    dist: {
        options: {
            source: '<%= source %>/',
            dest: '<%= dist %>/',
            env: 'dist'
        }
    },
    newscoop: {
        options: {
            source: '<%= dist %>/',
            dest: '<%= dist %>/',
            env: 'newscoop'
        }
    }
};