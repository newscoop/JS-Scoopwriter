describe('the images panel', function() {
    var paneButton;
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#access_token=test?article_number=64&language=de&nobackend');
        paneButton = element(by.css('[data-original-title="images"]'));
    });
    it('button is present', function() {
        expect(paneButton.isPresent()).toBe(true);
    });
    describe('opened', function() {
        beforeEach(function() {
            paneButton.click();
        });
        it('is visible', function() {
            element(by.className('image-panel')).isDisplayed();
        });
        it('shows the attach button', function() {
            element(by.css('[data-test-button="image-attach"]')).isDisplayed();
        });
    });
});
