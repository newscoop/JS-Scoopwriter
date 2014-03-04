describe('the snippets panel', function() {
    var status;
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#access_token=test?article_number=64&language=de&nobackend');
        status = element(by.css('.save-status'));
    });
    it('button is present', function() {
        expect(status.getText()).toBe('Just downloaded');
    });
});
