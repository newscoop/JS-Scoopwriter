exports.config = {
    specs: ['protractorTests/*Test.js'],
    multiCapabilities: [{
        'browserName': 'chrome'
    }, {
        'browserName': 'firefox'
    }, {
        'browserName': 'safari'
    }]
}
