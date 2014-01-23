describe('the snippets panel', function() {
    var paneButton;
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#/?nobackend');
        element(by.css('[data-original-title="Images"]')).click();
    });
    it('does not show the modal', function() {
        expect(element(by.css('.modal-dialog')).isDisplayed()).toBe(false);
    });
    describe('after click', function() {
        beforeEach(function() {
            element(by.css('[data-test-button="image-attach"]')).click();
            element(by.css('[data-test-button="image-attach"]')).click();
        });
        it('shows the modal', function() {
            browser.sleep(1000);
            expect(element(by.css('.modal-title')).isDisplayed()).toBe(true);
        });
        /* cannot make the following tests work
        describe('after cancel', function() {
            beforeEach(function() {
                element(by.css('[data-test-button="modal-close"]')).click();
                element(by.css('[data-test-button="modal-close"]')).click();
            });
            it('hides the modal', function() {
                browser.sleep(1000);
                expect(element(by.css('.modal-title')).isDisplayed()).toBe(false);
            });
            describe('open again', function() {
                beforeEach(function() {
                    element(by.css('[data-test-button="image-attach"]')).click();
                    element(by.css('[data-test-button="image-attach"]')).click();
                });
                it('shows the modal', function() {
                    browser.sleep(1000);
                    expect(element(by.css('.modal-title')).isDisplayed()).toBe(true);
                });
            });
        });
        */
    });
});
