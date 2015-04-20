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

    it('gets Youtube video thumbnail from the URL', function () {
        var expected,
            filtered,
            url;

        url = 'https://youtu.be/3EZF916Cet4';
        expected = '//img.youtube.com/vi/3EZF916Cet4/default.jpg';

        filtered = filter(url);
        expect(filtered).toEqual(expected);
    });

});
