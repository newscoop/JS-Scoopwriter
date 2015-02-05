module.exports = {
    options: {
        hostname: 'localhost',
        port: 9000,
        livereload: 35729
    },
    livereload: {
        options: {
            open: false,
            base: [
                '.tmp',
                '<%= source %>'
            ]
        }
    },
    test: {
        options: {
            hostname: '0.0.0.0',
            port: 9001,
            base: [
                '.tmp',
                'test',
                '<%= source %>'
            ]
        }
    },
    dist: { options: { base: '<%= dist %>' } }
};
