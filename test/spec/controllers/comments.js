'use strict';

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
        'new': {
            status: 'new',
        },
        approved: {
            status: 'approved',
        },
        any: {
            status: 'whatever'
        }
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        CommentsCtrl = $controller('CommentsCtrl', {
            $scope: scope,
            comments: commentsService
        });
    }));

    it('proxies comments', function () {
        expect(scope.comments).toBeDefined();
    });
    it('has the new filter unchecked', function() {
        expect(scope.statuses.new).toBe(false);
    });
    it('does not filter', function() {
        expect(scope.selected(comments.any)).toBe(true);
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
    describe('new comments selected', function() {
        beforeEach(function() {
            scope.toggle('new');
        });
        it('checks the `new` filter', function() {
            expect(scope.statuses['new']).toBe(true);
        });
        it('unchecks the `all` filter', function() {
            expect(scope.statuses.all).toBe(false);
        });
        it('accepts `new` comments', function() {
            expect(scope.selected(comments['new'])).toBe(true);
        });
        it('rejects other comments', function() {
            expect(scope.selected(comments.any)).toBe(false);
        });
        describe('new comments unselected', function() {
            beforeEach(function() {
                scope.toggle('new');
            });
            it('activates all again', function() {
                expect(scope.statuses.all).toBe(true);
            });
        });
        describe('approved comments selected', function() {
            beforeEach(function() {
                scope.toggle('approved');
            });
            it('accepts `new` comments', function() {
                expect(scope.selected(comments.new)).toBe(true);
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
                it('unchecks `new`', function() {
                    expect(scope.statuses['new']).toBe(false);
                });
                it('unchecks `approved`', function() {
                    expect(scope.statuses.approved).toBe(false);
                });
            });
        });
    });
});
