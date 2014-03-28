module.exports = {
    dist: {
        files: {
            src: [
                '<%= dist %>/scripts/{,*/}*.js',
                '<%= dist %>/styles/{,*/}*.css',
                '<%= dist %>/styles/fonts/*'
            ]
        }
    }
};