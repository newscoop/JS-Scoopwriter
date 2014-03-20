'use strict';

/* the purpose of this service is to provide a sorting for the
 * comments, that reflects their nesting. the strategy i choosed in
 * order to integrate easily with the rest of the comments logic, is
 * to not reflect the sorting with a nested data structure, but just
 * filing a `nestedPosition` property inside each comment. this
 * stategy provides a simpler data structure, but it is inefficient
 * computationally. this should not be a problem.
 */

/* the nested sorting happens in place in the input array, and it has
 * to be performed again every time the comments array changes */

/* note that nesting alone is not enough for sorting, also the
 * `create` property is taken into account */

describe('Service: nestedSort', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var nestedSort;
    beforeEach(inject(function (_nestedSort_) {
        nestedSort = _nestedSort_;
    }));

    it('has a main function', function () {
        expect(nestedSort.sort).toBeDefined();
    });
    describe('the sort function', function() {
        var sort;
        beforeEach(function() {
            sort = nestedSort.sort;
        });
        it('can be fired on an empty array', function() {
            expect(function() {
                sort([]);
            }).not.toThrow();
        });
        describe('on a simple regular array of four elements', function() {
            /* i write "regular" because we have no surprises, for
             * example missing parents. that would go on a different
             * describe block */
            var comments;
            beforeEach(function() {
                comments = [{
                    id: 0,
                    thread_level: 0,
                    created: '2014-03-18T17:27:27+0000'
                }, {
                    id: 1,
                    thread_level: 1,
                    parent: 0,
                    created: '2014-03-18T18:27:27+0000'
                }, {
                    id: 2,
                    thread_level: 1,
                    parent: 0,
                    created: '2014-03-18T19:27:27+0000'
                }, {
                    id: 3,
                    thread_level: 0,
                    created: '2014-03-18T20:27:27+0000'
                }];
            });
            it('computes the nestedPosition properties correctly', function() {
                sort(comments);
                expect(comments[0].nestedPosition).toBe(0);
                expect(comments[1].nestedPosition).toBe(1);
                expect(comments[2].nestedPosition).toBe(2);
                expect(comments[3].nestedPosition).toBe(3);
            });
        });
    });

});
