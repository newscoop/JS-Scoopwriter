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

describe('The Editor UI', function() {
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000/#/?nobackend');
        // browser.sleep(3000);
    });

    describe('Pane Interaction', function() {
        var TabList = function(side) {
            return element(by.className(side+'-tablist'));
        }

        var TabPane = function(side) {
            var tablist = TabList(side);
            // var tablist = element(by.className(side+'-tablist'));
            return tablist.findElement(by.tagName('li'));
        }

        var AnchorElement = function(side) {
            var tablist = TabList(side);
            return tablist.findElement(by.tagName('a'));
        }

        it('has a main article', function() {
            mainArticle = element(by.id('main-article'));
            expect(mainArticle.isPresent());
        });

        describe('Left Pane', function() {
            it('has a tablist', function() {
                var tablist = TabList('left');
                expect(tablist.isPresent()).toBe(true);
            });

            it('has a tabpane', function() {
                var tabpane = TabPane('left');
                expect(tabpane.getTagName()).toBe('li');
            });

            it('has a button', function() {
                var anchor = AnchorElement('left');
                expect(anchor.getTagName()).toBe('a');
            });

            it('should resize the Article view if opened and closed', function() {
                var mainArticle = element(by.id('main-article'));
                var anchor = AnchorElement('left');
                var tabpane = TabPane('left');

                anchor.click();
                expect(tabpane.getAttribute('class')).toMatch('active');
                
                expect(mainArticle.getAttribute('class')).toMatch('shrink-left');
                expect(mainArticle.getAttribute('class')).not.toMatch('shrink-right');

                anchor.click();
                expect(tabpane.getAttribute('class')).not.toMatch('active');
                expect(mainArticle.getAttribute('class')).not.toMatch('shrink-left');
                expect(mainArticle.getAttribute('class')).not.toMatch('shrink-right');
            });
        });

        describe('Right Pane', function() {
            it('has a tablist', function() {
                var tablist = TabList('right');
                expect(tablist.isPresent()).toBe(true);
            });

            it('has a tabpane', function() {
                var tabpane = TabPane('right');
                expect(tabpane.getTagName()).toBe('li');
            });

            it('has a button', function() {
                var anchor = AnchorElement('right');
                expect(anchor.getTagName()).toBe('a');
            });

            it('should resize the Article view if opened and closed', function() {
                var mainArticle = element(by.id('main-article'));
                var anchor = AnchorElement('right');
                var tabpane = TabPane('right');

                anchor.click();
                expect(tabpane.getAttribute('class')).toMatch('active');
                
                expect(mainArticle.getAttribute('class')).not.toMatch('shrink-left');
                expect(mainArticle.getAttribute('class')).toMatch('shrink-right');

                anchor.click();
                expect(tabpane.getAttribute('class')).not.toMatch('active');
                expect(mainArticle.getAttribute('class')).not.toMatch('shrink-left');
                expect(mainArticle.getAttribute('class')).not.toMatch('shrink-right');
            });
        });

        describe('Both Panes', function() {
            it('have a tablist', function() {
                var tablistLeft = TabList('left');
                expect(tablistLeft.isPresent()).toBe(true);

                var tablistRight = TabList('right');
                expect(tablistRight.isPresent()).toBe(true);
            });

            it('have a tabpane', function() {
                var tabpaneLeft = TabPane('left');
                expect(tabpaneLeft.getTagName()).toBe('li');

                var tabpaneRight = TabPane('right');
                expect(tabpaneRight.getTagName()).toBe('li');
            });

            it('have a button', function() {
                var anchorLeft = AnchorElement('left');
                expect(anchorLeft.getTagName()).toBe('a');

                var anchorRight = AnchorElement('right');
                expect(anchorRight.getTagName()).toBe('a');
            });

            it('should resize the Article view if opened and closed', function() {
                var mainArticle = element(by.id('main-article'));
                var anchorLeft = AnchorElement('left');
                var anchorRight = AnchorElement('right');
                var tabpaneLeft = TabPane('left');
                var tabpaneRight = TabPane('right');

                anchorLeft.click();
                anchorRight.click();

                expect(tabpaneLeft.getAttribute('class')).toMatch('active');
                expect(tabpaneRight.getAttribute('class')).toMatch('active');

                expect(mainArticle.getAttribute('class')).toMatch('shrink-left');
                expect(mainArticle.getAttribute('class')).toMatch('shrink-right');

                anchorLeft.click();
                anchorRight.click();

                expect(tabpaneLeft.getAttribute('class')).not.toMatch('active');
                expect(tabpaneRight.getAttribute('class')).not.toMatch('active');

                expect(mainArticle.getAttribute('class')).not.toMatch('shrink-left');
                expect(mainArticle.getAttribute('class')).not.toMatch('shrink-right');
            });
        });
    });

    describe('Drag and Drop', function() {
        it('it can drag', function() {
            // find the draggable pane
            var anchor = element(by.xpath('//a[@data-original-title="Images"]'));
            anchor.click();

            // get the div with the images
            var mediaImages = element(by.id('media-images'));

            // get the first image
            var img = mediaImages.findElement(by.xpath('//img[@sf-draggable]'));
        });

    });
});
