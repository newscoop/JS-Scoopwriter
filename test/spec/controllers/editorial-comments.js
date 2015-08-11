'use strict';

/**
* Module with tests for the editorial comments controller.
*
* @module EditorialComments controller tests
*/

describe('Controller: EditorialCommentsCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var CommentsCtrl,
        scope,
        $intervalSpy,
        $interval,
        $q,
        commentsThenMethod = function (callback) {
            callback();
        },
        commentsThenErrorMethod = function (callback, errorCallback) {
            errorCallback();
        },
        commentsService = {
            displayed: [],
            init: function() {
                return {
                    then: commentsThenMethod
                };
            },
            add: function (comment) {
                return {
                    then: commentsThenMethod
                };
            }
        },
        editorialComments = {},

        article,
        Article,
        fakeComment,
        log = {
            debug: jasmine.createSpy('debug mock')
        };

    // Initialize the controller and a mock scope
    beforeEach(inject(function (
        $controller,
        $rootScope,
        _Article_,
        _$interval_,
        _$q_) {
        var articleService;

        Article = _Article_;
        $interval = _$interval_;
        $intervalSpy = jasmine.createSpy('$interval', $interval);

        article = {
            promise: {
                then: jasmine.createSpy('promise mock')
            }
        };

        articleService = {
            articleInstance: article
        };

        $q = _$q_;
        scope = $rootScope.$new();

        CommentsCtrl = $controller('EditorialCommentsCtrl', {
            $scope: scope,
            editorialComments: commentsService,
            article: articleService,
            $log: log,
            $interval: $intervalSpy

        });
    }));

    it('proxies comments', function () {
        expect(CommentsCtrl.comments).toBeDefined();
    });

    describe('controller\'s initComments() method', function () {
        it('should call initComments method', function () {
            var deferred = $q.defer();
            editorialComments.init = function () {
                return deferred.promise;
            };

            CommentsCtrl.initComments();
            deferred.resolve(true);
            scope.$digest();
            expect(CommentsCtrl.isLoading).toBe(false);
        });
    });

    describe('controller\'s fetchComments() method', function () {
        it('should register the interval', function () {
            var deferredInit = $q.defer();
            CommentsCtrl.fetchComments();
            deferredInit.resolve(true);
            scope.$digest();

            expect($intervalSpy.callCount).toBe(1);
            expect($intervalSpy).toHaveBeenCalledWith(CommentsCtrl.initComments, 20000);
        });

        it('should cancel the interval on $destroy', function () {
            CommentsCtrl.fetchComments();
            expect($intervalSpy.callCount).toBe(1);
            scope.$destroy();
        });
    });

    describe('controller\'s toggleResolved() method', function () {
        var deferred,
            deferredSave,
            toaster,
            fakeComment,
            $q;

        beforeEach(inject(function (_$q_, _toaster_) {
            $q = _$q_;
            deferred = $q.defer();
            deferredSave = $q.defer();
            toaster = _toaster_;
            fakeComment = {
                toggleResolved: function () {
                }
            };

            spyOn(fakeComment, 'toggleResolved').andCallFake(function () {
                return deferredSave.promise;
            });

            spyOn(toaster, 'add').andCallFake(function () {
                return deferred.promise;
            });
        }));

        it('calls toaster.add() with appropriate params on success', function () {
            CommentsCtrl.toggleResolved(fakeComment);
            deferredSave.resolve(true);
            scope.$digest();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.editorialcomments.resolve.success'
            });
        });

        it('calls toaster.add() with appropriate params on error', function () {
            CommentsCtrl.toggleResolved(fakeComment);
            deferredSave.reject();
            scope.$digest();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.editorialcomments.resolve.error'
            });
        });
    });

    describe('controller\'s saveComment() method', function () {
        var deferred,
            deferredSave,
            toaster,
            fakeComment,
            $q;

        beforeEach(inject(function (_$q_, _toaster_) {
            $q = _$q_;
            deferred = $q.defer();
            deferredSave = $q.defer();
            toaster = _toaster_;
            fakeComment = {
                save: function () {
                }
            };

            spyOn(fakeComment, 'save').andCallFake(function () {
                return deferredSave.promise;
            });

            spyOn(toaster, 'add').andCallFake(function () {
                return deferred.promise;
            });
        }));

        it('calls toaster.add() with appropriate params on success', function () {
            CommentsCtrl.saveComment(fakeComment);
            deferredSave.resolve(true);
            scope.$digest();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.comments.edit.success'
            });
        });

        it('calls toaster.add() with appropriate params on error', function () {
            CommentsCtrl.saveComment(fakeComment);
            deferredSave.reject();
            scope.$digest();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.comments.edit.error'
            });
        });
    });

    describe('controller\'s sendReply() method', function () {
        var deferred,
            deferredReply,
            fakeComment,
            toaster,
            $q;

        beforeEach(inject(function (_$q_, _toaster_) {
            $q = _$q_;
            deferred = $q.defer();
            deferredReply = $q.defer();
            toaster = _toaster_;
            fakeComment = {
                sendReply: function () {
                }
            };

            spyOn(fakeComment, 'sendReply').andCallFake(function () {
                return deferredReply.promise;
            });

            spyOn(toaster, 'add').andCallFake(function () {
                return deferred.promise;
            });
        }));

        it('calls toaster.add() with appropriate params on success', function () {
            CommentsCtrl.sendReply(fakeComment);
            deferredReply.resolve(true);
            scope.$digest();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.comments.reply.success'
            });
        });

        it('calls toaster.add() with appropriate params on error', function () {
            CommentsCtrl.sendReply(fakeComment);
            deferredReply.reject();
            scope.$digest();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.comments.reply.error'
            });
        });
    });

    describe('controller\'s cancel() method', function () {
        it('Cancels adding a new comment.', function () {
            CommentsCtrl.create.comment = "test comment";
            CommentsCtrl.cancel();

            expect(CommentsCtrl.create).toEqual({});
            expect(CommentsCtrl.adding).toBe(false);
        });
    });

    describe('disabled form when comment is being posted', function () {
        var $q,
            toaster,
            comment = {
            message: "Comment message",
        };

        beforeEach(inject(function (_$q_, _toaster_) {
            $q = _$q_;
            toaster = _toaster_;
        }));

        it('isSending flag initially cleared', function () {
            expect(CommentsCtrl.isSending).toBe(false);
        });

        it('sets isSending flag before posting a comment', function () {
            var origThen = commentsThenMethod;

            // prevent any actions after posting is done, we want to
            // examine the state as it was when the posting started
            commentsThenMethod = function (callback) { };

            CommentsCtrl.add(comment);
            expect(CommentsCtrl.isSending).toBe(true);

            commentsThenMethod = origThen;
        });

        it('calls toaster.add() with appropriate params on success', function () {
            var deferred = $q.defer();
            var deferredAdd = $q.defer();

            editorialComments.add = function () {
                return deferredAdd.promise;
            };

            spyOn(toaster, 'add').andCallFake(function () {
                return deferred.promise;
            });

            CommentsCtrl.add(comment);
            deferredAdd.resolve(true);
            scope.$digest();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.comments.add.success'
            });
        });

        it('calls toaster.add() with appropriate params on error', function () {
            var deferred = $q.defer();
            var origThen = commentsThenMethod;

            // simulate an error response when CommentsCtrl.add() is invoked
            commentsThenMethod = commentsThenErrorMethod;

            spyOn(toaster, 'add').andCallFake(function () {
                return deferred.promise;
            });

            CommentsCtrl.add(comment);
            scope.$digest();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.comments.add.error'
            });
        });

        it('clears isSending flag when posting is done', function () {
            // after an update, isSending flag should be back to false
            CommentsCtrl.add(comment);
            expect(CommentsCtrl.isSending).toBe(false);
        });

       it('clears isSending flag on errors', function () {
            var origThen = commentsThenMethod;

            // simulate an error response when CommentsCtrl.add() is invoked
            commentsThenMethod = commentsThenErrorMethod;

            CommentsCtrl.add(comment);
            expect(CommentsCtrl.isSending).toBe(false);

            commentsThenMethod = origThen;
        });
    });
});
