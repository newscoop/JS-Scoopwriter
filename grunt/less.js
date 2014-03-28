module.exports = {
    dist: {
        options: {
            paths: ['<%= source %>/styles'],
            cleancss: true
        },
        files: { '<%= dist %>/styles/main.css': '<%= source %>/styles/main.less' }
    },
    server: {
        options: {
            paths: ['<%= source %>/styles'],
            cleancss: false
        },
        files: { '.tmp/styles/main.css': '<%= source %>/styles/main.less' }
    }
};