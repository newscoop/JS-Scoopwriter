'use strict';

/**
* Module with tests for the comments controller.
*
* @module Comments controller tests
*/

describe('Controller: CommentsCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var CommentsCtrl,
    scope,
    commentsThenMethod = function (callback) {
        callback();
    },
    commentsThenErrorMethod = function (callback, errorCallback) {
        errorCallback();
    },
    commentsService = {
        displayed: [],
        init: function() {},
        add: function (comment) {
            return {
                then: commentsThenMethod
            };
        }
    },
    /* samples of comments with different statuses in order to test
     * filtering */
    comments = {
        pending: {
            status: 'pending',
        },
        approved: {
            status: 'approved',
        },
        any: {
            status: 'whatever'
        }
    },
    log = {
        debug: jasmine.createSpy('debug mock')
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        CommentsCtrl = $controller('CommentsCtrl', {
            $scope: scope,
            comments: commentsService,
            $log: log
        });
    }));

    it('proxies comments', function () {
        expect(scope.comments).toBeDefined();
    });
    it('has the pending filter unchecked', function() {
        expect(scope.statuses.pending).toBe(false);
    });
    it('does not filter', function() {
        expect(scope.selected(comments.any)).toBe(true);
    });
    it('has a nested sorting', function() {
        expect(scope.sorting.text).toBe('Nested');
    });

    describe('scope\'s toggleShowStatus() method', function () {
        it('sets global show status from "expanded" to "collapsed"',
            function () {
                scope.globalShowStatus = 'expanded';
                scope.toggleShowStatus();
                expect(scope.globalShowStatus).toBe('collapsed');
        });

        it('sets global show status from "collapsed" to "expanded"',
            function () {
                scope.globalShowStatus = 'collapsed';
                scope.toggleShowStatus();
                expect(scope.globalShowStatus).toBe('expanded');
        });
    });

    describe('when it can load more comments', function() {
        beforeEach(function() {
            spyOn(commentsService, 'init');
            commentsService.canLoadMore = true;
        });
        describe('when sorting changed', function() {
            beforeEach(function() {
                scope.sorting = scope.sortings[1];
                scope.$apply();
            });
            it('triggers the watch handler', function() {
                expect(log.debug).toHaveBeenCalledWith('sorting changed');
            });
            it('has a chronological sorting', function() {
                expect(scope.sorting.text).toBe('Chronological');
            });
            it('reinitialises', function() {
                expect(commentsService.init)
                    .toHaveBeenCalledWith({sorting:'chronological'});
            });
            describe('when sorting changed again', function() {
                beforeEach(function() {
                    scope.sorting = scope.sortings[0];
                    scope.$apply();
                });
                it('triggers the watch handler', function() {
                    expect(log.debug).toHaveBeenCalledWith('sorting changed');
                });
                it('has a chronological sorting', function() {
                    expect(scope.sorting.text).toBe('Nested');
                });
                it('reinitialises', function() {
                    expect(commentsService.init)
                        .toHaveBeenCalledWith({sorting:'nested'});
                });
            });
        });
    });
    describe('when it cannot load more comments', function() {
        beforeEach(function() {
            spyOn(commentsService, 'init');
            commentsService.canLoadMore = false;
        });
        describe('when sorting changed', function() {
            beforeEach(function() {
                scope.sorting = scope.sortings[1];
            });
            it('has a chronological sorting', function() {
                expect(scope.sorting.text).toBe('Chronological');
            });
            it('does not reinitialise', function() {
                expect(commentsService.init).not.toHaveBeenCalled();
            });
        });
    });
    describe('disabled form when comment is being posted', function () {
        var comment = {
            subject: "Comment subject",
            message: "Comment message",
        };

        it('isSending flag initially cleared', function () {
            expect(scope.isSending).toBe(false);
        });

        it('sets isSending flag before posting a comment', function () {
            var origThen = commentsThenMethod;

            // prevent any actions after posting is done, we want to
            // examine the state as it was when the posting started
            commentsThenMethod = function (callback) { };

            scope.add(comment);
            expect(scope.isSending).toBe(true);

            commentsThenMethod = origThen;
        });

        it('clears isSending flag when posting is done', function () {
            // after an update, isSending flag should be back to false
            scope.add(comment);
            expect(scope.isSending).toBe(false);
        });

       it('clears isSending flag on errors', function () {
            var origThen = commentsThenMethod;

            // simulate an error response when scope.add() is invoked
            commentsThenMethod = commentsThenErrorMethod;

            scope.add(comment);
            expect(scope.isSending).toBe(false);

            commentsThenMethod = origThen;
        });
    });

    describe('the `all` status', function() {
        var status;
        beforeEach(function() {
            status = scope.statuses.all;
        });
        it('is checked', function() {
            expect(status).toBe(true);
        });
    });
    describe('pending comments selected', function() {
        beforeEach(function() {
            scope.toggle('pending');
        });
        it('checks the `pending` filter', function() {
            expect(scope.statuses['pending']).toBe(true);
        });
        it('unchecks the `all` filter', function() {
            expect(scope.statuses.all).toBe(false);
        });
        it('accepts `pending` comments', function() {
            expect(scope.selected(comments['pending'])).toBe(true);
        });
        it('rejects other comments', function() {
            expect(scope.selected(comments.any)).toBe(false);
        });
        describe('pending comments unselected', function() {
            beforeEach(function() {
                scope.toggle('pending');
            });
            it('activates all again', function() {
                expect(scope.statuses.all).toBe(true);
            });
        });
        describe('approved comments selected', function() {
            beforeEach(function() {
                scope.toggle('approved');
            });
            it('accepts `pending` comments', function() {
                expect(scope.selected(comments.pending)).toBe(true);
            });
            it('accepts `approved` comments', function() {
                expect(scope.selected(comments.approved)).toBe(true);
            });
            it('rejects other comments', function() {
                expect(scope.selected(comments.any)).toBe(false);
            });
            describe('all comments selected', function() {
                beforeEach(function() {
                    scope.toggle('all');
                });
                it('accepts all comments', function() {
                    expect(scope.selected(comments.any)).toBe(true);
                });
                it('checks `all`', function() {
                    expect(scope.statuses.all).toBe(true);
                });
                it('unchecks `pending`', function() {
                    expect(scope.statuses['pending']).toBe(false);
                });
                it('unchecks `approved`', function() {
                    expect(scope.statuses.approved).toBe(false);
                });
            });
        });
    });
});
