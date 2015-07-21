'use strict';

/**
* Module with tests for the sortComment filter.
*
* @module sortComments filter tests
*/

describe('Filter: sortComments', function () {

    var mock = [{
        created:"2013-04-17T20:25:53+0000",
        nestedPosition: 3
    }, {
        created:"2013-04-17T23:53:19+0000",
        nestedPosition: 1
    }, {
        created:"2013-04-18T04:04:55+0000",
        nestedPosition: 2
    }, {
        created:"2013-02-12T16:22:45+0000",
        nestedPosition: 5
    }, {
        created:"2013-04-19T04:04:55+0000",
        nestedPosition: 4
    }];

    // load the filter's module
    beforeEach(module('authoringEnvironmentApp'));

    describe('"Nested" version', function () {
        var filterFactory;

        beforeEach(inject(function ($filter) {
            filterFactory = $filter('sortComments');
        }));

        it('sorts comments by thread order', function () {
            var i,
                sorted = filterFactory(mock, 'Nested');

            for (i = 0; i < sorted.length; i++) {
                expect(sorted[i].nestedPosition).toBe(i + 1);
            }
        });
    });

    describe('"Chronological" version', function () {
        var filterFactory;

        beforeEach(inject(function ($filter) {
            filterFactory = $filter('sortComments');
        }));

        it('sorts comments by creation date (descending)', function () {
            var sorted = filterFactory(mock, 'Chronological');
            expect(sorted[0].created).toBe("2013-04-19T04:04:55+0000");
            expect(sorted[1].created).toBe("2013-04-18T04:04:55+0000");
            expect(sorted[2].created).toBe("2013-04-17T23:53:19+0000");
            expect(sorted[3].created).toBe("2013-04-17T20:25:53+0000");
            expect(sorted[4].created).toBe("2013-02-12T16:22:45+0000");
        });
    });

    describe('"Chronological ascending" version', function () {
        var filterFactory;

        beforeEach(inject(function ($filter) {
            filterFactory = $filter('sortComments');
        }));

        it('sorts comments by creation date (descending)', function () {
            var sorted = filterFactory(mock, 'Chronological (asc.)');

            expect(sorted[0].created).toBe("2013-02-12T16:22:45+0000");
            expect(sorted[1].created).toBe("2013-04-17T20:25:53+0000");
            expect(sorted[2].created).toBe("2013-04-17T23:53:19+0000");
            expect(sorted[3].created).toBe("2013-04-18T04:04:55+0000");
            expect(sorted[4].created).toBe("2013-04-19T04:04:55+0000");
        });
    });

    describe('creating unknown filter version', function () {
        var filterFactory;

        beforeEach(inject(function ($filter) {
            filterFactory = $filter('sortComments');
        }));

        it('throws an error', function () {
            expect(function () {
                filterFactory(mock, 'unknwonFilterVersion');
            }).toThrow();
        });
    });

});
