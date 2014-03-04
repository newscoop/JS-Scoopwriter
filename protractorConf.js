exports.config = {
    /* modify the following to focus on a specific test */
    specs: ['protractorTests/*Test.js'],
    /* comment the following to iterate faster */
    multiCapabilities: [{
        'browserName': 'chrome'
    }, {
        'browserName': 'firefox'
    }, {
        'browserName': 'safari'
    }]
    /**/
}
