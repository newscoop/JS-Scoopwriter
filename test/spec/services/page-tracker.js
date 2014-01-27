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
    var PageTracker, tracker;
    beforeEach(inject(function (_pageTracker_) {
        PageTracker = _pageTracker_;
        tracker = PageTracker.getTracker({max: 5});
    }));

    describe('first page added', function() {
        beforeEach(function() {
            tracker.next(1);
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
        it('returns a special value after the max', function() {
            expect(tracker.next()).toBe('none');
        });
    });

});
