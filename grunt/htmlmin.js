module.exports = {
    dist: {
        options: {},
        files: [{
                expand: true,
                cwd: '<%= source %>',
                src: [
                    '*.html',
                    'views/{,*/}*.{html,htm}'
                ],
                dest: '<%= dist %>'
            }]
    }
};