'use strict';
/*
  
  The purpose of this object is to help fetching paginated remote
  resources. In this case, some request may fail, so we may have some
  holes in the fetched collection. This object keeps track of the
  loaded pages, and tells us what is the next page to be loaded.
  
*/
describe('Service: pageTracker', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var pageTracker, tracker;
    beforeEach(inject(function (_pageTracker_) {
        pageTracker = _pageTracker_;
        tracker = pageTracker.getTracker();
    }));

    it('tells us when a pagination section belongs to a last page', function() {
        expect(pageTracker.isLastPage({
            "itemsPerPage":5,
            "currentPage":"2",
            "itemsCount":10,
            "previousPageLink":"http:\/\/tw-merge.lab.sourcefabric.org\/content-api\/comments\/article\/533522\/de?page=1&items_per_page=5&access_token=NWI3NTZjOGJjMTA5YjFlOGE0M2FkYzQ5ZjE5MjhiZjMyZTcwNTQ2NmYwZTVkODAyMTZkODRmZDI3ZDUxZmY0Yg"
        })).toBe(true);
        expect(pageTracker.isLastPage({
            "itemsPerPage":"3",
            "currentPage":"2",
            "itemsCount":"10",
            "previousPageLink":"http:\/\/tw-merge.lab.sourcefabric.org\/content-api\/comments\/article\/533522\/de?page=1&items_per_page=5&access_token=NWI3NTZjOGJjMTA5YjFlOGE0M2FkYzQ5ZjE5MjhiZjMyZTcwNTQ2NmYwZTVkODAyMTZkODRmZDI3ZDUxZmY0Yg"
        })).toBe(false);
    });

    describe('first page added', function() {
        beforeEach(function() {
            tracker.next();
        });
        it('tells us what is the next page to fetch', function() {
            expect(tracker.next()).toBe(2);
        });
        describe('second page added', function() {
            beforeEach(function() {
                tracker.next();
            });
            it('tells us what is the next page to fetch', function() {
                expect(tracker.next()).toBe(3);
            });
            describe('after removing an already added page', function() {
                beforeEach(function() {
                    tracker.remove(1);
                });
                it('knows that it lost the page', function() {
                    expect(tracker.has(1)).toBe(false);
                });
                it('tells us what are the next pages to fetch', function() {
                    expect(tracker.next()).toBe(1);
                    expect(tracker.next()).toBe(3);
                });
            });
        });
    });
    describe('all pages asked to the max', function() {
        var asked = [];
        beforeEach(function() {
            for(var i=1; i<=5; i++) {
                asked.push(tracker.next());
            }
        });
        it('gives us pages to the max', function() {
            expect(asked).toEqual([1, 2, 3, 4, 5]);
        });
    });

});
