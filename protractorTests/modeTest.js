/* 
 * some examples
 *
 * search by repeater
 * var firstElementInRepeater = element(by.repeater("pane in panes|filter:{position:'left', selected:true}").row(0));
 *
 * search by data-attribute
 * var anchor = element(by.xpath('//a[@data-original-title="Draggable"]'));
 * anchor.click();
 */

describe('start page', function() {
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#access_token=test?nobackend');
        // browser.sleep(3000);
    });

    it('is in normal mode', function() {
        expect(element(by.css('.authoring-environment')).getAttribute('class'))
            .not.toMatch('zen-mode');
    });
    describe('gone zen', function() {
        beforeEach(function() {
            element(by.css('#zen-mode')).click();
        });
        it('is in zen mode', function() {
            expect(element(by.css('.authoring-environment'))
                   .getAttribute('class'))
                .toMatch('zen-mode');
        });
        describe('gone normal', function() {
            beforeEach(function() {
                element(by.css('#test-go-normal')).click();
            });
            it('is in normal mode', function() {
                expect(element(by.css('.authoring-environment'))
                       .getAttribute('class'))
                    .not.toMatch('zen-mode');
            });
        });
    });
});
