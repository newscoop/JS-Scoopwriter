describe('the save toolbar', function() {
    var status;
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#access_token=test?article_number=64&language=de&nobackend');
        status = element(by.css('.save-status'));
    });
    it('status is correct', function() {
        expect(status.getText()).toBe('Saved');
    });
});
