module.exports = {
    server: [
        'devcode:server',
        'coffee:dist',
        'less:server',
        'copy:styles'
    ],
    test: [
        'coffee',
        'copy:styles'
    ],
    dist: [
        'coffee',
        'less:dist',
        'copy:styles',
        'svgmin',
        'htmlmin'
    ]
};