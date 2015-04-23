'use strict';

/**
* Module with tests for the youtubeThumbnail filter.
*
* @module youtubeThumbnail filter tests
*/

describe('Filter: youtubeThumbnail', function () {

    var filter;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($filter) {
        filter = $filter('youtubeThumbnail');
    }));

    it('gets Youtube video thumbnail from short URL', function () {
        var expected,
            filtered,
            url;

        url = 'https://youtu.be/3EZF916Cet4';
        expected = '//img.youtube.com/vi/3EZF916Cet4/default.jpg';

        filtered = filter(url);
        expect(filtered).toEqual(expected);
    });

    it('gets Youtube video thumbnail from the URL', function () {
        var expected,
            filtered,
            url;

        url = 'https://www.youtube.com/watch?v=3EZF916Cet4';
        expected = '//img.youtube.com/vi/3EZF916Cet4/default.jpg';

        filtered = filter(url);
        expect(filtered).toEqual(expected);
    });

    it('doesnt\'t match the expected value', function () {
        var expected,
            filtered,
            url;

        url = 'https://fake.url?param=3EZF916Cet4';
        expected = '//img.youtube.com/vi/3EZF916Cet4/default.jpg';

        filtered = filter(url);
        expect(filtered).not.toEqual(expected);
    });

});
