describe('the snippets panel', function() {
    var paneButton;
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#access_token=test?nobackend');
        element(by.css('[data-original-title="Images"]')).click();
    });
    it('does not show the modal', function() {
        expect(element(by.css('.modal-dialog')).isDisplayed()).toBe(false);
    });
    describe('after click', function() {
        beforeEach(function() {
            browser.sleep(500);
            element(by.css('[data-test-button="image-attach"]')).click();
            browser.sleep(500);
        });
        it('shows the modal', function() {
            expect(element(by.css('.modal-title')).isDisplayed()).toBe(true);
        });
        it('selects the archive source by default', function() {
            expect(element(by.css('.attach-image .archive')).isDisplayed())
                .toBe(true);
        });
        /*
        describe('image attached', function() {
            beforeEach(function() {
                element(by.css('.thumbnail')).click();
            });
            it('attaches one image', function() {
                expect(element(by.css('.media-image figure img')).isPresent())
                    .toBe(true);
            });
            describe('after cancel', function() {
                beforeEach(function() {
                    element(by.css('[data-test-button="modal-close"]')).click();
                    element(by.css('[data-test-button="modal-close"]')).click();
                });
                it('hides the modal', function() {
                    browser.sleep(2000);
                    expect(element(by.css('.modal-title')).isDisplayed()).toBe(false);
                });
                it('it can drag', function() {
                    browser.sleep(2000);
                    // get the div with the images
                    var mediaImages = element(by.id('media-images'));

                    // get the first image
                    var img = mediaImages.findElement(by.xpath('//img[@sf-draggable]'));
                });
            });
        });
        */
    });
});
