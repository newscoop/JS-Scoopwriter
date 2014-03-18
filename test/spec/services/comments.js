'use strict';

/**
* Module with tests for the comments service.
*
* @module Comments service tests
*/

describe('Service: Comments', function () {

    var items = [{
            "id":24,
            "author":"Boom-boom Boba",
            "subject":"I approve",
            "message":"I approve this choice, and I do congratulate. Cheers!",
            "thread_level":0,
            "thread_order":1,
            "status":"approved",
            "created":"2013-05-02T10:11:13+0200",
            "updated":"-0001-11-30T00:00:00+0100",
            "recommended":0
        }, {
            "id":25,
            "author":"Black Persona",
            "subject":"",
            "message":"no screw that!",
            "thread_level":0,
            "thread_order":3,
            "status":"approved",
            "created":"2013-05-02T10:13:28+0200",
            "updated":"2014-03-06T11:57:11+0100",
            "recommended":0
        }, {
            "id":58,
            "author":"yorick",
            "parent":41,
            "subject":"ahfadfh",
            "message":"adfhadhg",
            "thread_level":2,
            "thread_order":2,
            "status":"approved",
            "created":"2014-03-04T14:37:55+0100",
            "updated":"2014-03-04T14:37:55+0100",
            "recommended":0
        }
    ];

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    describe('the resource', function() {
        var $httpBackend, comments;
        beforeEach(inject(function (_comments_, _$httpBackend_, _article_) {
            $httpBackend = _$httpBackend_;
            comments = _comments_;
            _article_.promise = {
                then: function(f) {
                    f({
                        number: 64,
                        language: 'de'
                    });
                }
            };
        }));
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
        });
        it('deletes a comment', function() {
            var spy = jasmine.createSpy('spy');
            $httpBackend.expect(
                'DELETE',
                rootURI + '/comments/article/64/de/12'
            ).respond(200, '');
            comments.resource.delete({
                articleNumber: 64,
                languageCode: 'de',
                commentId: 12
            }, spy);
            $httpBackend.flush();
            expect(spy).toHaveBeenCalled();
        });

        it('saves a comment', function() {
            var spies = {
                data: function() { return true; },
                success: function() {}
            };
            spyOn(spies, 'data').andCallThrough();
            spyOn(spies, 'success');
            $httpBackend.expect(
                'POST',
                rootURI + '/comments/article/64/de',
                spies.data
            ).respond(200, '');
            comments.resource.save({
                articleNumber: 64,
                languageCode: 'de'
            }, {
                message: 'hey, Joe, let us go!'
            }, spies.success);
            $httpBackend.flush();
            expect(spies.success).toHaveBeenCalled();
            expect(spies.data).toHaveBeenCalledWith('message=hey%2C+Joe%2C+let+us+go!');
        });
    });

    describe('not paginated', function() {
        var comments, $httpBackend, response, $q;
        beforeEach(inject(function (_comments_, _$httpBackend_, _article_, _$q_) {
            $q = _$q_;
            response = {
                items: items
            };
            $httpBackend = _$httpBackend_;
            $httpBackend.expect(
                'GET',
                rootURI + '/comments/article/64/de?items_per_page=50&page=1'
            ).respond(response);
            comments = _comments_;
            _article_.promise = {
                then: function(f) {
                    f({
                        number: 64,
                        language: 'de'
                    });
                }
            };
            comments.init();
        }));

        it('init() resets everything to default values', function () {
            // prevent load() to do anything (any subsequent changes),
            // here we just want to test if default values has been set
            comments.load = function () {
                return {
                    then: function () {}
                }
            };

            comments.canLoadMore = false;
            comments.loaded.push(items[0], items[1]);
            comments.displayed.push(items[0]);
            comments.tracker.next();

            comments.init();

            expect(comments.canLoadMore).toBe(true);
            expect(comments.loaded.length).toBe(0);
            expect(comments.displayed.length).toBe(0);
            expect(comments.tracker.next()).toBe(2);
        });

        describe('server answered', function() {
            beforeEach(function() {
                $httpBackend.flush();
            });
            it('has comments', function () {
                expect(comments.displayed.length).toBe(3);
            });
            describe('comment created', function() {
                var p = {
                    comment: {
                        subject: 'subj',
                        message: 'message',
                        author: 'sancio'
                    }
                };
                beforeEach(function() {
                    spyOn(comments.resource, 'create');
                    comments.add(p);
                });
                it('creates a comment', function() {
                    expect(comments.resource.create.mostRecentCall.args[1])
                        .toEqual({ comment : { subject : 'subj', message : 'message', author : 'sancio' } });
                });
                it('adds the comment on success', function() {
                    var location = rootURI + '/comments/26996';
                    $httpBackend.expect(
                        'GET',
                        location
                    ).respond({});
                    comments.resource.create
                        .mostRecentCall.args[2]({}, function() {
                            return location;
                        });
                    $httpBackend.flush();
                    expect(comments.displayed.length).toBe(4);
                });
            });
            describe('a single comment', function() {
                var comment;
                beforeEach(function() {
                    comment = comments.displayed[0];
                });
                describe('removed', function() {
                    beforeEach(function() {
                        comments.displayed[0].remove();
                    });
                    it('removes itself', function() {
                        expect(comments.displayed.length).toBe(3);
                    });
                });

                it('is not being edited by default', function () {
                    expect(comment.isEdited).toBe(false);
                });

                it('is collapsed by default', function () {
                    expect(comment.showStatus).toBe('collapsed');
                });

                it('is not in reply-to mode by default', function () {
                    expect(comment.isReplyMode).toBe(false);
                });

                it('sendingReply flag is not set by default', function () {
                    expect(comment.sendingReply).toBe(false);
                });

                describe('replyTo() method', function () {
                    it('enters into reply-to mode', function () {
                        comment.isReplyMode = false;
                        comment.replyTo();
                        expect(comment.isReplyMode).toBe(true);
                    });
                });

                describe('cancelReply() method', function () {
                    it('exits from reply-to mode', function () {
                        comment.isReplyMode = true;
                        comment.cancelReply();
                        expect(comment.isReplyMode).toBe(false);
                    });
                });

                describe('sendReply() method', function () {
                    var deferred;

                    beforeEach(inject(function ($q) {
                        deferred = $q.defer()
                        comment.reply.subject = 'reply subject';
                        comment.reply.message = 'reply message';
                        spyOn(comments, 'add').andCallFake(function () {
                            return deferred.promise;
                        });
                    }));

                    it('sets sendingReply flag', function () {
                        comment.sendingReply = false;
                        comment.sendReply();
                        expect(comment.sendingReply).toBe(true);
                    });

                    it('invokes add() with correct arguments', function () {
                        comment.sendReply();
                        expect(comments.add.mostRecentCall.args[0]).toEqual({
                            comment: {
                                subject: 'reply subject',
                                message: 'reply message',
                                parent: 24
                            }
                        });
                    });

                    describe('on success', function () {
                        var $rootScope;

                        beforeEach(inject(function (_$rootScope_) {
                            $rootScope = _$rootScope_;
                        }));

                        it('clears sendingReply flag', function () {
                            comment.sendingReply = true;
                            comment.sendReply();
                            deferred.resolve();
                            $rootScope.$apply();

                            expect(comment.sendingReply).toBe(false);
                        });

                        it('exits from reply-to mode', function () {
                            comment.isReplyMode = true;
                            comment.sendReply();
                            deferred.resolve();
                            $rootScope.$apply();

                            expect(comment.isReplyMode).toBe(false);
                        });

                        it('resets reply object to default', function () {
                            comment.sendReply();
                            deferred.resolve();
                            $rootScope.$apply();

                            expect(comment.reply.subject).toBe(
                                'Re: I approve');
                            expect(comment.reply.message).toBe('');
                        });
                    });
                });

                describe('being edited', function() {
                    beforeEach(function() {
                        comment.edit();
                    });
                    it('updates its editing content', function() {
                        expect(comment.editing.subject).toBe('I approve');
                        expect(comment.editing.message).toBe(
                            'I approve this choice, and I do ' +
                            'congratulate. Cheers!'
                        );
                    });
                    it('knows that it is being edited', function() {
                        expect(comment.isEdited).toBe(true);
                    });

                    it('disables reply-to mode', function () {
                        comment.isReplyMode = true;
                        comment.edit();
                        expect(comment.isReplyMode).toBe(false);
                    });

                    describe('fields changed', function() {
                        beforeEach(function() {
                            comment.editing.subject = 'edited subject';
                            comment.editing.message = 'edited message';
                        });
                        describe('canceled', function() {
                            beforeEach(function() {
                                comment.cancel();
                            });
                            it('is not being edited anymore', function() {
                                expect(comment.isEdited).toBe(false);
                            });
                            describe('edited', function() {
                                beforeEach(function() {
                                    comment.edit();
                                });
                                it('resets the contents', function() {
                                    expect(comment.editing.subject)
                                        .toBe('I approve');
                                    expect(comment.editing.message).toBe(
                                        'I approve this choice, and I do ' +
                                        'congratulate. Cheers!'
                                    );
                                });
                            });
                        });
                        describe('saved', function() {
                            beforeEach(function() {
                                $httpBackend.expect(
                                    'POST',
                                    rootURI + '/comments/article/64/de/24'
                                ).respond(200, '');
                                comment.save();
                                $httpBackend.flush();
                            });
                            it('is done with editing', function() {
                                expect(comment.isEdited).toBe(false);
                            });
                            it('gets updated', function() {
                                expect(comment.subject).toBe('edited subject');
                                expect(comment.message).toBe('edited message');
                            });
                        });
                    });
                });
            });
        });
    });
    describe('paginated', function() {
        var response, comments, $httpBackend;
        beforeEach(inject(function (_comments_, _$httpBackend_, _article_) {
            response = {
                items: items,
                "pagination":{
                    "itemsPerPage":3,
                    "currentPage":1,
                    "itemsCount":149735
                }
            };
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET(
                rootURI + '/comments/article/64/de?items_per_page=50&page=1'
            ).respond(response);
            $httpBackend.expectGET(
                rootURI + '/comments/article/64/de?items_per_page=50&page=2'
            ).respond(response);
            comments = _comments_;
            _article_.promise = {
                then: function(f) {
                    f({
                        number: 64,
                        language: 'de'
                    });
                }
            };
            comments.init();
            $httpBackend.flush();
        }));
        it('performs two requests', function() {
            $httpBackend.verifyNoOutstandingExpectation();
        });
        it('shows three comments', function() {
            expect(comments.displayed.length).toBe(3);
        });
        it('already loaded the next comments', function() {
            expect(comments.loaded.length).toBe(3);
        });
        describe('requesting new comments', function() {
            beforeEach(function() {
                comments.more();
                $httpBackend.expectGET(
                    rootURI + '/comments/article/64/de?items_per_page=50&page=3'
                ).respond(response);
            });
            it('immediately shows the three loaded comments', function() {
                expect(comments.loaded.length).toBe(0);
                expect(comments.displayed.length).toBe(6);
            });
            describe('after a response', function() {
                beforeEach(function() {
                    $httpBackend.flush();
                });
                it('adds the newly loaded comments', function() {
                    expect(comments.loaded.length).toBe(3);
                    expect(comments.displayed.length).toBe(6);
                });
            });
        });
    });
});
