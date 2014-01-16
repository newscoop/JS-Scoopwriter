describe('the editor starting page', function() {
    beforeEach(function() {
        browser.get('http://127.0.0.1:9000');
    });

    it('should resize the article view if a pane is opened on the left', function() {
        var mainArticle = element(by.id('main-article'));
        var tablistleft = element(by.className('left-tablist'));
        var anchorElementLeft = tablistleft.findElement(by.tagName('a'));

        // open the pane
        anchorElementLeft.click();

        expect(mainArticle.getAttribute('class')).toMatch('shrink-left');
        expect(mainArticle.getAttribute('class')).not.toMatch('shrink-right');

        // close the pane
        anchorElementLeft.click();

        expect(mainArticle.getAttribute('class')).not.toMatch('shrink-left');
        expect(mainArticle.getAttribute('class')).not.toMatch('shrink-right');
    });

    it('should resize the article view if a pane is opened on the right', function() {
        var mainArticle = element(by.id('main-article'));
        var tablistright = element(by.className('right-tablist'));
        var anchorElementRight = tablistright.findElement(by.tagName('a'));

        // open the pane
        anchorElementRight.click();

        expect(mainArticle.getAttribute('class')).toMatch('shrink-right');
        expect(mainArticle.getAttribute('class')).not.toMatch('shrink-left');

        // close the pane
        anchorElementRight.click();

        expect(mainArticle.getAttribute('class')).not.toMatch('shrink-right');
        expect(mainArticle.getAttribute('class')).not.toMatch('shrink-left');
    });
});