'use strict';

/**
* Module with tests for the stripHTML filter.
*
* @module stripHTML filter tests
*/

describe('Filter: stripHTML', function () {

    var filter;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($filter) {
        filter = $filter('stripHTML');
    }));

    it('removes HTML tags from text', function () {
        var expected,
            filtered,
            text;

        text = 'Quote: <p class="quote">This is <b>foo</b>bar.</p>';
        expected = 'Quote: This is foobar.';

        filtered = filter(text);
        expect(filtered).toEqual(expected);
    });

    it('converts HTML entities to characters', function () {
        var expected,
            filtered,
            text;

        text = 'one &amp; two < &quot;three&quot;';
        expected = 'one & two < "three"';

        filtered = filter(text);
        expect(filtered).toEqual(expected);
    });

    it('converts non-breakable spaces to ordinary spaces', function () {
        var expected,
            filtered,
            text;

        text = ' one&nbsp;&nbsp;&nbsp;two ';
        expected = ' one   two ';

        filtered = filter(text);
        expect(filtered).toEqual(expected);
    });

});
