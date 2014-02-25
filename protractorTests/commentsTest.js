describe('the snippets panel', function() {
    var paneButton;
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#access_token=test?article_number=64&language=de&nobackend');
        paneButton = element(by.css('[data-original-title="Comments"]'));
    });
    it('button is present', function() {
        expect(paneButton.isPresent()).toBe(true);
    });
    describe('opened', function() {
        beforeEach(function() {
            paneButton.click();
        });
        it('is visible', function() {
            element(by.className('comments-panel')).isDisplayed();
        });
        it('shows two comments', function() {
            element.all(by.css('comment')).then(function(arr) {
                expect(arr.length).toEqual(2);
            });
        });
    });
});
