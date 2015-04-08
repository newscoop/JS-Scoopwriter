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
    $window,
    Translator,
    mockTranslator,
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
        },
        changeSelectedStatus: function(newStatus) {}
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

    article,
    Article,

    log = {
        debug: jasmine.createSpy('debug mock')
    };


    // Initialize the controller and a mock scope
    beforeEach(inject(function (
        $controller,
        $rootScope, 
        $injector,
        _Article_) {
        var articleService

        mockTranslator = {
            trans: function (value) {
                return value;
            }
        };

        $window = $injector.get('$window');
        $window.Translator = mockTranslator;
        Translator = $injector.get('Translator');

        Article = _Article_;

        article = {
            commenting: Object.freeze({
                ENABLED: 0,
                DISABLED: 1,
                LOCKED: 2
            }),
            changeCommentingSetting: function () {
                return {
                    then: function () {}
                };
            },
            promise: {
                then: jasmine.createSpy('promise mock')
            },
            comments_locked: false,
            comments_enabled: true
        };

        articleService = {
            articleInstance: article
        };

        scope = $rootScope.$new();

        CommentsCtrl = $controller('CommentsCtrl', {
            $scope: scope,
            comments: commentsService,
            article: articleService,
            $log: log
        });
    }));

    afterEach(function () {
        delete $window.Translator;
    });

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

    it('initializes commenting setting to article\'s setting', function () {
        expect(scope.commentingSettingSrv).toBe(Article.commenting.ENABLED);
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
        it('correctly sets commenting to "enabled"', function () {
            scope.commentingSetting = Article.commenting.DISABLED;
            scope.commentingSettingSrv = Article.commenting.DISABLED;
            article.comments_enabled = true;
            article.comments_locked = false;

            CommentsCtrl.initCommenting();

            expect(scope.commentingSetting).toBe(Article.commenting.ENABLED);
            expect(scope.commentingSettingSrv).toBe(
                Article.commenting.ENABLED);
        });

        it('correctly sets commenting to "disabled"', function () {
            scope.commentingSetting = Article.commenting.ENABLED;
            scope.commentingSettingSrv = Article.commenting.ENABLED;
            article.comments_enabled = false;
            article.comments_locked = false;

            CommentsCtrl.initCommenting();

            expect(scope.commentingSetting).toBe(Article.commenting.DISABLED);
            expect(scope.commentingSettingSrv).toBe(
                Article.commenting.DISABLED);
        });

        it('correctly sets commenting to "locked"', function () {
            scope.commentingSetting = Article.commenting.ENABLED;
            scope.commentingSettingSrv = Article.commenting.ENABLED;
            article.comments_enabled = false;
            article.comments_locked = true;

            CommentsCtrl.initCommenting();

            expect(scope.commentingSetting).toBe(Article.commenting.LOCKED);
            expect(scope.commentingSettingSrv).toBe(
                Article.commenting.LOCKED);
        });
    });


    describe('scope\'s updateCommentingDirtyFlag() method', function () {
        it('sets dirty flag when there IS a change in commenting ' +
           'option value"',
           function () {
                scope.commentingSetting = Article.commenting.DISABLED;
                scope.commentingSettingSrv = Article.commenting.LOCKED;
                scope.updateCommentingDirtyFlag();
                expect(scope.commentingOptDirty).toBe(true);
            }
        );

        it('clears dirty flag when there IS NO no change in commenting ' +
           'option value',
           function () {
                scope.commentingSetting = Article.commenting.LOCKED;
                scope.commentingSettingSrv = Article.commenting.LOCKED;
                scope.updateCommentingDirtyFlag();
                expect(scope.commentingOptDirty).toBe(false);
            }
        );
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
                    scope.commentingSetting = Article.commenting.LOCKED;
                    scope.commentingSettingSrv = Article.commenting.DISABLED;

                    scope.changeCommentingSetting();
                    expect(scope.commentingSettingSrv).toBe(
                        Article.commenting.DISABLED);

                    deferred.resolve();
                    scope.$apply();
                    expect(scope.commentingSettingSrv).toBe(
                        Article.commenting.LOCKED);
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
                    scope.commentingSettingSrv = Article.commenting.ENABLED;
                    scope.commentingSetting = Article.commenting.LOCKED;

                    scope.changeCommentingSetting();

                    deferred.reject('server timeout');
                    scope.$apply();
                    expect(scope.commentingSetting).toBe(
                        Article.commenting.ENABLED);
                }
            );

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

    describe('scope\'s countSelected() method', function () {
        it('returns zero (0) when no comments are displayed', function () {
            commentsService.displayed = [];
            expect(scope.countSelected()).toEqual(0);
        });

        it('returns zero (0) when no displayed comments are selected',
            function () {
                commentsService.displayed = [
                    {selected: false},
                    {selected: false},
                    {selected: false},
                    {selected: false},
                    {selected: false}
                ];
                expect(scope.countSelected()).toEqual(0);
        });

        it('returns the number selected displayed comments', function () {
            commentsService.displayed = [
                {selected: false},
                {selected: true},
                {selected: true},
                {selected: false},
                {selected: false}
            ];
            expect(scope.countSelected()).toEqual(2);
        });
    });

    describe('scope\'s confirmHideComments() method', function () {
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
            scope.confirmHideComments();
            expect(modalFactory.confirmLight).toHaveBeenCalled();
        });

        describe('commentId not given', function () {
            it('hides selected comments on action confirmation"',
                function () {
                    spyOn(commentsService, 'changeSelectedStatus');
                    scope.confirmHideComments();

                    deferred.resolve(true);
                    scope.$apply();

                    expect(commentsService.changeSelectedStatus)
                        .toHaveBeenCalledWith('hidden', false);
            });
        });

        describe('commentId given', function () {
            it('hides a specific comment on action confirmation"',
                function () {
                    spyOn(commentsService, 'changeSelectedStatus');
                    scope.confirmHideComments(42);

                    deferred.resolve(true);
                    scope.$apply();

                    expect(commentsService.changeSelectedStatus)
                        .toHaveBeenCalledWith('hidden', false, 42);
            });
        });

        it('does *not* hide anything on action rejection"', function () {
            spyOn(commentsService, 'changeSelectedStatus');
            scope.confirmHideComments();

            deferred.reject(false);
            scope.$apply();

            expect(commentsService.changeSelectedStatus).not.toHaveBeenCalled;
        });
    });

    describe('scope\'s confirmDeleteComments() method', function () {
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
            scope.confirmDeleteComments();
            expect(modalFactory.confirmHeavy).toHaveBeenCalled();
        });

        describe('commentId not given', function () {
            it('deletes selected comments and their subcomments ' +
                'on action confirmation"',
                function () {
                    spyOn(commentsService, 'changeSelectedStatus');
                    scope.confirmDeleteComments();

                    deferred.resolve(true);
                    scope.$apply();

                    expect(commentsService.changeSelectedStatus)
                        .toHaveBeenCalledWith('deleted', true);
            });
        });

        describe('commentId given', function () {
            it('deletes a specific comment and its subcomments ' +
                'on action confirmation"',
                function () {
                    spyOn(commentsService, 'changeSelectedStatus');
                    scope.confirmDeleteComments(42);

                    deferred.resolve(true);
                    scope.$apply();

                    expect(commentsService.changeSelectedStatus)
                        .toHaveBeenCalledWith('deleted', true, 42);
            });
        });

        it('does *not* delete anything on action rejection"', function () {
            spyOn(commentsService, 'changeSelectedStatus');
            scope.confirmDeleteComments();

            deferred.reject(false);
            scope.$apply();

            expect(commentsService.changeSelectedStatus).not.toHaveBeenCalled;
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
