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

        // TODO: add test for toggleRecommended when correct URL is known
    });

    describe('matchMaker() method', function () {
        var comments;

        beforeEach(inject(function (_comments_) {
            comments = _comments_;
        }));

        it('returns a function', function () {
            var func = comments.matchMaker(42);
            expect(typeof func).toBe('function');
        });

        describe('returned function', function () {
            it('returns true if <argument>.id equals <id> passed at creation',
                function () {
                    var param = {id: 42},
                        func = comments.matchMaker(42);
                    expect(func(param)).toBe(true);
            });

            it('returns false if <argument>.id does not equal <id>' +
               'passed at creation', function () {
                    var param = {id: 42},
                        func = comments.matchMaker(11);
                    expect(func(param)).toBe(false);
            });

            it('returns true based on equality, not identity', function () {
                    var param = {id: '42'},
                        func = comments.matchMaker(42);
                    expect(func(param)).toBe(true);
            });
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
                rootURI + '/comments/article/64/de/nested?items_per_page=50&page=1'
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
            it('cannot load more', function() {
                expect(comments.canLoadMore).toBe(false);
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
                });
                it('creates a comment', function() {
                    comments.add(p);
                    expect(comments.resource.create.mostRecentCall.args[1])
                        .toEqual({ comment : { subject : 'subj', message : 'message', author : 'sancio' } });
                });
                it('adds the comment on success', function() {
                    var location = rootURI + '/comments/26996';

                    comments.add(p);
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

               it('calls init() when no X-Location header', function() {
                    spyOn(comments, 'init');

                    expect(comments.init.callCount).toBe(0);
                    comments.add(p);
                    comments.resource.create
                        .mostRecentCall.args[2]({}, function() {
                            return '';  // simulate no X-Location header
                        });
                    expect(comments.init.callCount).toBe(1);
                });
            });

            describe('a single comment', function() {
                var comment;
                beforeEach(function() {
                    comment = comments.displayed[0];
                });

                describe('removed', function() {
                    var deferred,
                        $rootScope;

                    beforeEach(inject(function (comments, $q, _$rootScope_) {
                        deferred = $q.defer();
                        $rootScope = _$rootScope_;

                        spyOn(comments.resource, 'delete')
                        .andCallFake(function () {
                            deferred.resolve();
                            $rootScope.$apply();
                            return {$promise: deferred.promise};
                        });
                    }));

                    it('removes itself', function() {
                        comment.remove();
                        expect(comments.displayed.length).toBe(3);
                    });

                    it('removes from diplayed comments list', function () {
                        var index;

                        comment.remove();
                        deferred.resolve();
                        $rootScope.$apply();

                        expect(comments.displayed.length).toBe(2);
                        // also check that correct comment was deleted
                        index = _.findIndex(comments.displayed, { 'id': 24 });
                        expect(index).toBe(-1);
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

                describe('collapse() method', function () {
                    it('sets display status to "collapsed"', function () {
                        comment.showStatus = 'expanded';
                        comment.collapse();
                        expect(comment.showStatus).toBe('collapsed');
                    });

                    it('exits from reply-to mode', function () {
                        comment.isReplyMode = true;
                        comment.collapse();
                        expect(comment.isReplyMode).toBe(false);
                    });
                });

                describe('expand() method', function () {
                    it('sets display status to "expanded"', function () {
                        comment.showStatus = 'collapsed';
                        comment.expand();
                        expect(comment.showStatus).toBe('expanded');
                    });
                });

                describe('toggle() method', function () {
                    it('triggers a collapse of an expanded comment',
                        function () {
                            spyOn(comment, 'collapse');
                            comment.showStatus = 'expanded';
                            comment.toggle();
                            expect(comment.collapse).toHaveBeenCalled();
                    });

                    it('triggers an expansion of a collapsed comment',
                        function () {
                            spyOn(comment, 'expand');
                            comment.showStatus = 'collapsed';
                            comment.toggle();
                            expect(comment.expand).toHaveBeenCalled();
                    });
                });

                it('"recommended" flag is a Boolean', function () {
                    expect(typeof comment.recommended).toBe('boolean');
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
                        deferred = $q.defer();
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

                describe('toggleRecommended() method', function () {

                    beforeEach(inject(function () {
                        spyOn(comments.resource, 'toggleRecommended')
                        .andCallFake(function () {
                            var method = comments.resource.toggleRecommended;
                            if (method.mostRecentCall.args.length >= 3) {
                                // the third argument is a success handler and
                                // we invoke it to simulate a successful
                                // response
                                method.mostRecentCall.args[2]();
                            }
                        });
                    }));

                    it('provides correct arguments to resource', function () {
                        var callArgs;

                        comment.toggleRecommended();

                        callArgs = comments.resource.toggleRecommended
                            .mostRecentCall.args;
                        expect(callArgs.length).toBeGreaterThan(0);
                        expect(callArgs[0]).toEqual({
                            articleNumber: 64,
                            languageCode: 'de',
                            commentId: 24
                        });
                    });

                    it('toggles "recommended" flag from false to true',
                        function () {
                            comment.recommended = false;
                            comment.toggleRecommended();
                            expect(comment.recommended).toBe(true);
                    });

                    it('toggles "recommended" flag from true to false',
                        function () {
                            comment.recommended = true;
                            comment.toggleRecommended();
                            expect(comment.recommended).toBe(false);
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
                rootURI + '/comments/article/64/de/nested?items_per_page=50&page=1'
            ).respond(response);
            $httpBackend.expectGET(
                rootURI + '/comments/article/64/de/nested?items_per_page=50&page=2'
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
        it('can load more', function() {
            expect(comments.canLoadMore).toBe(true);
        });
        describe('if a different sorting is specified', function() {
            beforeEach(function() {
                $httpBackend
                    .expectGET(rootURI + '/comments/article/64/de?items_per_page=50&page=1')
                    .respond({})
                comments.init({
                    sorting: 'chronological'
                });
            });
            it('changes the location', function () {
                $httpBackend.verifyNoOutstandingExpectation();
            });
            describe('if a different sorting is specified again', function() {
                beforeEach(function() {
                    $httpBackend
                        .expectGET(rootURI + '/comments/article/64/de/nested?items_per_page=50&page=1')
                        .respond({})
                    comments.init({
                        sorting: 'nested'
                    });
                });
                it('changes the location again', function () {
                    $httpBackend.verifyNoOutstandingExpectation();
                });
            });
        });

        describe('requesting new comments', function() {
            var location;

            beforeEach(function() {
                location = rootURI +
                    '/comments/article/64/de/nested?items_per_page=50&page=3';
                $httpBackend.expectGET(location).respond(response);
            });

            it('immediately shows the three loaded comments', function() {
                comments.more();
                expect(comments.loaded.length).toBe(0);
                expect(comments.displayed.length).toBe(6);
            });

            it('logs an error when there are no more somments to load',
                inject(function ($log) {
                    var callArgs,
                        errorMethod = spyOn($log, 'error');

                    comments.canLoadMore = false;
                    comments.more();

                    expect(errorMethod.callCount).toBe(1);
                    callArgs = errorMethod.mostRecentCall.args;
                    expect(callArgs.length).toBe(1);
                    expect(typeof callArgs[0]).toBe('string');
                    expect(
                        callArgs[0].indexOf('More comments required')
                    ).toBe(0);
            }));

            describe('after a response', function() {
                it('adds the newly loaded comments', function() {
                    comments.more();
                    $httpBackend.flush();
                    expect(comments.loaded.length).toBe(3);
                    expect(comments.displayed.length).toBe(6);
                });

                it('on error the requested comments page is removed',
                    function () {
                        var removeMethod = spyOn(comments.tracker, 'remove');
                        $httpBackend.resetExpectations();
                        $httpBackend.expectGET(location).respond(500, '');

                        comments.more();
                        $httpBackend.flush();

                        expect(removeMethod.callCount).toBe(1);
                        expect(removeMethod).toHaveBeenCalledWith(3);
                });
            });
        });
    });
});
