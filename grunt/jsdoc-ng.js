module.exports = {
    all: {
        template: 'jsdoc-ng',
        dest: 'docs',
        src: [ 
            '<%= source %>/scripts/{,*/}*.js',
         ],
        options: {
            "templates": {
                "cleverLinks":    true,
                "monospaceLinks": true,
                "windowTitle": "jsDocNG Sample",
                "minify": false
            },
            "markdown": {
                "parser": "gfm",
                "hardwrap": true
            }
        }
    }
};
