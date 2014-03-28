module.exports = {
    options: {
        port: 9000,
        hostname: '0.0.0.0',
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