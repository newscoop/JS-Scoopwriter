describe('the snippets panel', function() {
    var paneButton;
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#/?nobackend');
        paneButton = element(by.css('[data-original-title="Images"]'));
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
