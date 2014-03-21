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

    // helper function to find the id of a comment in a given position
    function byPosition(arr, pos) {
        return _.find(arr, function(element) {
            return element.nestedPosition == pos;
        });
    }

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var nestedSort, $log;
    beforeEach(inject(function (_nestedSort_, _$log_) {
        nestedSort = _nestedSort_;
        $log = _$log_;
        spyOn($log, 'error');
        spyOn($log, 'debug');
    }));
    afterEach(function(){
        expect($log.error).not.toHaveBeenCalled();
        expect($log.debug).not.toHaveBeenCalled();
    });

    it('has a main function', function () {
        expect(nestedSort.sort).toBeDefined();
    });
    it('sorts by created', function() {
        var unsorted = [{
            id: 4,
            created: '2014-03-18T23:27:27+0000'
        }, {
            id: 7,
            created: '2014-03-18T20:27:27+0000'
        }];
        var sorted = nestedSort.sortByCreated(unsorted);
        expect(sorted[0].id).toBe(7);
        expect(sorted[1].id).toBe(4);
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
        describe('on a bigger regular array reverse sorted', function() {
            /* i write "regular" because we have no surprises, for
             * example missing parents. that would go on a different
             * describe block */
            var comments;
            beforeEach(function() {
                comments = [{
                    id: 1,
                    thread_level: 2,
                    parent: 3,
                    created: '2014-03-18T16:27:27+0000'
                }, {
                    id: 0,
                    thread_level: 0,
                    created: '2014-03-18T17:27:27+0000'
                }, {
                    id: 2,
                    thread_level: 2,
                    parent: 3,
                    created: '2014-03-18T15:27:27+0000'
                }, {
                    id: 3,
                    thread_level: 1,
                    parent: 4,
                    created: '2014-03-18T14:27:27+0000'
                }, {
                    id: 5,
                    thread_level: 1,
                    parent: 7,
                    created: '2014-03-18T12:27:27+0000'
                }, {
                    id: 4,
                    thread_level: 0,
                    created: '2014-03-18T13:27:27+0000'
                }, {
                    id: 6,
                    thread_level: 1,
                    parent: 7,
                    created: '2014-03-18T11:27:27+0000'
                }, {
                    id: 7,
                    thread_level: 0,
                    created: '2014-03-18T10:27:27+0000'
                }];
                sort(comments);
            });
            it('computes the correct map', function() {
                expect(nestedSort.map[7].childs[0].id).toBe(5);
                expect(nestedSort.map[7].childs[1].id).toBe(6);
                expect(nestedSort.map[7].childs[0].nestedPosition).toBe(2);
                expect(nestedSort.map[7].childs[1].nestedPosition).toBe(1);
            });
            it('computes the nestedPosition properties correctly', function() {
                expect(byPosition(comments, 0).id).toBe(7);
                expect(byPosition(comments, 1).id).toBe(6);
                expect(byPosition(comments, 2).id).toBe(5);
                expect(byPosition(comments, 3).id).toBe(4);
                expect(byPosition(comments, 4).id).toBe(3);
                expect(byPosition(comments, 5).id).toBe(2);
                expect(byPosition(comments, 6).id).toBe(1);
                expect(byPosition(comments, 7).id).toBe(0);
            });
        });
    });

});
