module.exports = {
    all: {
        dest: '<%= dist %>/scripts/_bower.js',
        exclude: [
            'ng-aloha-editor'
        ],
        mainFiles: {
            'angular-oauth': ['src/js/angularOauth.js', 'src/js/googleOauth.js']
        },
        bowerOptions: {
            relative: false
        }
    }
}
