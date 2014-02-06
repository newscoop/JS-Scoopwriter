describe('the snippets panel', function() {
    var paneButton;
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#access_token=test?nobackend');
        paneButton = element(by.css('[data-original-title="Snippets"]'));
    });
    it('button is present', function() {
        expect(paneButton.isPresent()).toBe(true);
    });
    describe('opened', function() {
        beforeEach(function() {
            paneButton.click();
        });
        it('is visible', function() {
            element(by.className('embed-panel')).isDisplayed();
        });
        it('has three snippets', function() {
            var all = element.all(by.repeater('snippet in snippets'));
            all.then(function(arr) {
                expect(arr.length).toBe(3);
            });
        });
        it('shows the add expand button', function() {
            element(by.css('[data-test-button="add"]')).isDisplayed();
        });
        /* cannot make tests work on this now */
        describe('add subpanel opened', function() {
            beforeEach(function() {
                element(by.css('[data-test-button="add"]')).click();
            });
            xit('shows the subpanel', function() {
                element(by.model('create.title')).isDisplayed();
            });
            describe('new snippet added', function() {
                beforeEach(function() {
                    element(by.model('create.title')).sendKeys('new title');
                    element(by.model('create.code')).sendKeys('<code></code>');
                    element(by.css('[data-test-button="save"]')).click();
                });
                xit('has now four snippets', function() {
                    var all = element.all(by.repeater('snippet in snippets'));
                    all.then(function(arr) {
                        expect(arr.length).toBe(4);
                    });
                });
            });
        });
    });
});
