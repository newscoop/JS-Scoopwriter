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

    article = {
        commenting: {
            ENABLED: 0,
            DISABLED: 1,
            LOCKED: 2
        },
        changeCommentingSetting: function () {
            return {
                then: function () {}
            };
        },
        promise: {
            then: jasmine.createSpy('promise mock')
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
            article: article,
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

    it('has article commenting enabled by default', function () {
        // initCommenting() reads the actual article data, thus we have to
        // disable it for the purpose of the test
        spyOn(CommentsCtrl, 'initCommenting');
        expect(scope.commentingSettingSrv).toBe(article.commenting.ENABLED);
    });

    it('has commenting option dirty flag *not* set by default', function () {
        expect(scope.commentingOptDirty).toBe(false);
    });

    it('has changing commenting flag *not* set by default', function () {
        expect(scope.isChangingCommenting).toBe(false);
    });

    it('exposes article.commenting option values in $scope', function () {
        expect(scope.commenting).toEqual(article.commenting);
    });

    describe('initCommenting() method', function () {
        var deferred,
            $q;

        beforeEach(inject(function (_$q_) {
            $q = _$q_;
            deferred = $q.defer();
            article.promise = deferred.promise;
        }));

        it('correctly sets commenting to "enabled"', function () {
            scope.commentingSetting = article.commenting.DISABLED;
            scope.commentingSettingSrv = article.commenting.DISABLED;

            CommentsCtrl.initCommenting();
            deferred.resolve({
                comments_enabled: 1,
                comments_locked: 0
            });
            scope.$apply();

            expect(scope.commentingSetting).toBe(article.commenting.ENABLED);
            expect(scope.commentingSettingSrv).toBe(
                article.commenting.ENABLED);
        });

        it('correctly sets commenting to "disabled"', function () {
            scope.commentingSetting = article.commenting.ENABLED;
            scope.commentingSettingSrv = article.commenting.ENABLED;

            CommentsCtrl.initCommenting();
            deferred.resolve({
                comments_enabled: 0,
                comments_locked: 0
            });
            scope.$apply();

            expect(scope.commentingSetting).toBe(article.commenting.DISABLED);
            expect(scope.commentingSettingSrv).toBe(
                article.commenting.DISABLED);
        });

        it('correctly sets commenting to "locked"', function () {
            scope.commentingSetting = article.commenting.ENABLED;
            scope.commentingSettingSrv = article.commenting.ENABLED;

            CommentsCtrl.initCommenting();
            deferred.resolve({
                comments_enabled: 0,
                comments_locked: 1
            });
            scope.$apply();

            expect(scope.commentingSetting).toBe(article.commenting.LOCKED);
            expect(scope.commentingSettingSrv).toBe(
                article.commenting.LOCKED);
        });
    });

    describe('scope\'s updateCommentingDirtyFlag() method', function () {

        it('sets dirty flag when there IS a change in commenting ' +
           'option value"', function () {
                scope.commentingSetting = article.commenting.DISABLED;
                scope.commentingSettingSrv = article.commenting.LOCKED;
                scope.updateCommentingDirtyFlag();
                expect(scope.commentingOptDirty).toBe(true);
        });

        it('clears dirty flag when there IS NO no change in commenting ' +
           'option value', function () {
                scope.commentingSetting = article.commenting.LOCKED;
                scope.commentingSettingSrv = article.commenting.LOCKED;
                scope.updateCommentingDirtyFlag();
                expect(scope.commentingOptDirty).toBe(false);
        });
    });

    describe('scope\'s changeCommentingSetting() method', function () {
        var deferred,
            $q;

        beforeEach(inject(function (_$q_) {
            $q = _$q_;
            deferred = $q.defer();

            spyOn(article, 'changeCommentingSetting').andCallFake(function () {
                return deferred.promise;
            });
        }));

        it('sets changing commenting flag', function () {
            scope.isChangingCommenting = false;
            scope.changeCommentingSetting();
            expect(scope.isChangingCommenting).toBe(true);
        });

        describe('on server success response', function () {
            it('sets scope\'s commenting setting (server) to new value',
                function () {
                    scope.commentingSetting = article.commenting.LOCKED;
                    scope.commentingSettingSrv = article.commenting.DISABLED;

                    scope.changeCommentingSetting();
                    expect(scope.commentingSettingSrv).toBe(
                        article.commenting.DISABLED);

                    deferred.resolve();
                    scope.$apply();
                    expect(scope.commentingSettingSrv).toBe(
                        article.commenting.LOCKED);
            });

            it('clears commenting option dirty flag', function () {
                scope.commentingOptDirty = true;

                scope.changeCommentingSetting();
                deferred.resolve();
                scope.$apply();

                expect(scope.commentingOptDirty).toBe(false);
            });

            it('clears changing commenting flag', function () {
                scope.changeCommentingSetting();
                deferred.resolve();
                scope.$apply();

                expect(scope.isChangingCommenting).toBe(false);
            });
        });

        describe('on server error response', function () {

            it('sets scope\'s commenting setting back to original value',
                function () {
                    scope.commentingSetting = article.commenting.LOCKED;

                    scope.changeCommentingSetting();
                    expect(scope.commentingSetting).toBe(
                        article.commenting.LOCKED);

                    deferred.reject('server timeout');
                    scope.$apply();
                    expect(scope.commentingSetting).toBe(
                        article.commenting.ENABLED);
            });

            it('clears commenting option dirty flag', function () {
                scope.commentingOptDirty = true;

                scope.changeCommentingSetting();
                deferred.reject('server timeout');
                scope.$apply();

                expect(scope.commentingOptDirty).toBe(false);
            });

            it('clears changing commenting flag', function () {
                scope.changeCommentingSetting();
                expect(scope.isChangingCommenting).toBe(true);

                deferred.reject('server timeout');
                scope.$apply();
                expect(scope.isChangingCommenting).toBe(false);
            });
        });
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

    describe('scope\'s confirmHideSelected() method', function () {
        var deferred,
            modalFactory,
            resultPromise;

        beforeEach(inject(function ($q, _modalFactory_) {
            modalFactory = _modalFactory_;
            deferred = $q.defer();
            resultPromise = deferred.promise;

            spyOn(modalFactory, 'confirmLight').andCallFake(function () {
                return {
                    result: resultPromise
                }
            });
        }));

        it('opens a "light" confirmation dialog', function () {
            scope.confirmHideSelected();
            expect(modalFactory.confirmLight).toHaveBeenCalled();
        });

        it('TODO: does something on action confirmation"', function () {
            scope.confirmHideSelected();
            deferred.resolve(true);
        });

        it('TODO: does something on action rejection"', function () {
            scope.confirmHideSelected();
            deferred.reject(false);
        });
    });

    describe('scope\'s confirmDeleteSelected() method', function () {
        var deferred,
            modalFactory,
            resultPromise;

        beforeEach(inject(function ($q, _modalFactory_) {
            modalFactory = _modalFactory_;
            deferred = $q.defer();
            resultPromise = deferred.promise;

            spyOn(modalFactory, 'confirmHeavy').andCallFake(function () {
                return {
                    result: resultPromise
                }
            });
        }));

        it('opens a "heavy" confirmation dialog', function () {
            scope.confirmDeleteSelected();
            expect(modalFactory.confirmHeavy).toHaveBeenCalled();
        });

        it('TODO: does something on action confirmation"', function () {
            scope.confirmDeleteSelected();
            deferred.resolve(true);
        });

        it('TODO: does something on action rejection"', function () {
            scope.confirmDeleteSelected();
            deferred.reject(false);
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
