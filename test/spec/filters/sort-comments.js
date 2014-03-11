'use strict';

describe('Filter: sortComments', function () {

    var mock = [{
        created:"2013-04-17T20:25:53+0000",
        thread_order: 3,
    }, {
        created:"2013-04-17T23:53:19+0000",
        thread_order: 1,
    }, {
        created:"2013-04-18T04:04:55+0000",
        thread_order: 2,
    }];

    // load the filter's module
    beforeEach(module('authoringEnvironmentApp'));

    // initialize a new instance of the filter before each test
    var sortComments;
    beforeEach(inject(function ($filter) {
        sortComments = $filter('sortComments');
    }));

    it('does thread sorting', function () {
        var sorted = sortComments(mock, 'Nested');
        expect(sorted[0].thread_order).toBe(1);
        expect(sorted[1].thread_order).toBe(2);
        expect(sorted[2].thread_order).toBe(3);
    });
    it('does chronological sorting', function () {
        var sorted = sortComments(mock, 'Chronological');
        expect(sorted[0].created).toBe("2013-04-18T04:04:55+0000");
        expect(sorted[1].created).toBe("2013-04-17T23:53:19+0000");
        expect(sorted[2].created).toBe("2013-04-17T20:25:53+0000");
    });

});
