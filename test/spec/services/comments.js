'use strict';

/**
* Module with tests for the comments service.
*
* @module Comments service tests
*/

describe('Service: Comments', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    var $window,
        Translator,
        mockTranslator,
        items = [{
            id: 24,
            author: 'Boom-boom Boba',
            subject: 'I approve',
            message: 'I approve this choice, and I do congratulate. Cheers!',
            thread_level: 0,
            thread_order: 1,
            status: 'approved',
            created: '2013-05-02T10:11:13+0200',
            updated: '-0001-11-30T00:00:00+0100',
            recommended: 0
        }, {
            id: 25,
            author: 'Black Persona',
            subject: '',
            message: 'no screw that!',
            thread_level: 0,
            thread_order: 3,
            status: 'approved',
            created: '2013-05-02T10:13:28+0200',
            updated: '2014-03-06T11:57:11+0100',
            recommended: 0
        }, {
            id: 58,
            author: 'yorick',
            parent: 41,
            subject: 'ahfadfh',
            message: 'adfhadhg',
            thread_level: 2,
            thread_order: 2,
            status: 'approved',
            created: '2014-03-04T14:37:55+0100',
            updated: '2014-03-04T14:37:55+0100',
            recommended: 0
        }
    ];

    beforeEach(module(function ($provide) {
        // create a fake article service to inject around into other services
        var articleServiceMock = {
            articleInstance: {articleId: 64, language: 'de'}
        };
        $provide.value('article', articleServiceMock);
    }));

    beforeEach(inject(function ($injector) {
        mockTranslator = {
            trans: function (value) {
                return value;
            }
        };

        $window = $injector.get('$window');
        $window.Translator = mockTranslator;
        Translator = $injector.get('Translator');
    }));

    afterEach(function () {
        delete $window.Translator;
    });

    describe('the resource', function() {
        var $httpBackend, comments;
        beforeEach(inject(function (_comments_, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            comments = _comments_;
        }));
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
        });
        it('deletes a comment', function() {
            var spy = jasmine.createSpy('spy'),
                url;

            url= Routing.generate(
                'newscoop_gimme_comments_deletecomment_1',
                {articleNumber: 64, languageCode: 'de', commentId: 12}, true
            );

            $httpBackend.expect('DELETE', url).respond(200, '');
            comments.resource.delete({
                articleNumber: 64,
                languageCode: 'de',
                commentId: 12
            }, spy);
            $httpBackend.flush();
            expect(spy).toHaveBeenCalled();
        });

        it('saves a comment', function() {
            var success = jasmine.createSpy('success'),
                url;

            url= Routing.generate(
                'newscoop_gimme_comments_createcomment',
                {articleNumber: 64, languageCode: 'de'}, true
            );

            $httpBackend.expect(
                'POST',
                url,
                'message=hey%2C+Joe%2C+let+us+go!'
            ).respond(200, '');
            comments.resource.save({
                articleNumber: 64,
                languageCode: 'de'
            }, {
                message: 'hey, Joe, let us go!'
            }, success);
            $httpBackend.flush();
            expect(success).toHaveBeenCalled();
        });

        describe('toggleRecommended action', function () {
            it('invokes correct API method', function () {
                var url= Routing.generate(
                    'newscoop_gimme_comments_updatecomment',
                    {commentId: 1234}, true
                );
                $httpBackend.expect(
                    'PATCH',
                    rootURI + '/comments/1234.json'
                ).respond(200, {});

                comments.resource.toggleRecommended({commentId: 1234}, {});
            });
        });
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


    describe('changeSelectedStatus() method', function () {
        var displayed,
            service;

        beforeEach(inject(function (comments) {
            service = comments;

            displayed = [
                { id: 10, parent: undefined, thread_level: 0},
                { id: 20, parent: undefined, thread_level: 0},
                { id: 30, parent: 20, thread_level: 1},
                { id: 40, parent: 30, thread_level: 2},
                { id: 50, parent: 20, thread_level: 1},
                { id: 60, parent: undefined, thread_level: 0},
                { id: 70, parent: 60, thread_level: 1},
                { id: 80, parent: 70, thread_level: 2}
            ];

            displayed.forEach(function (comment) {
                comment.selected = false;
                comment.status = 'approved';
                comment.changeStatus = function (newStatus) {
                    this.status = newStatus;
                };
            });

            service.displayed = displayed;
        }));

        it('changes status of a single comment when commentId is given ' +
           'and deep === false',
            function () {
                displayed[6].selected = true;  // should have no effect

                service.changeSelectedStatus('pending', false, 30);

                service.displayed.forEach(function (comment) {
                    if (comment.id === 30) {
                        expect(comment.status).toEqual('pending');
                    } else {
                        expect(comment.status).toEqual('approved');
                    }
                });
            }
        );

        it('changes statuses of selected comments when commentId is *not* ' +
           'given and deep === false',
            function () {
                displayed[1].selected = true;
                displayed[6].selected = true;

                service.changeSelectedStatus('pending', false);

                service.displayed.forEach(function (comment) {
                    if (comment.id === 20 || comment.id === 70) {
                        expect(comment.status).toEqual('pending');
                    } else {
                        expect(comment.status).toEqual('approved');
                    }
                });
            }
        );

        it('changes statuses of a comment and its subcomments when ' +
           'commentId is given and deep === true',
            function () {
                displayed[6].selected = true;  // should have no effect

                service.changeSelectedStatus('pending', true, 20);

                service.displayed.forEach(function (comment) {
                    if (_.indexOf([20, 30, 40, 50], comment.id) > -1) {
                        expect(comment.status).toEqual('pending');
                    } else {
                        expect(comment.status).toEqual('approved');
                    }
                });
            }
        );

        it('changes statuses of selected comments and their subcomments ' +
           'when commentId is *not* given and deep === true',
            function () {
                displayed[1].selected = true;
                displayed[3].selected = true;
                displayed[6].selected = true;

                service.changeSelectedStatus('pending', true);

                service.displayed.forEach(function (comment) {
                    if (_.indexOf([20, 30, 40, 50, 70, 80], comment.id) > -1) {
                        expect(comment.status).toEqual('pending');
                    } else {
                        expect(comment.status).toEqual('approved');
                    }
                });
            }
        );

    });


    describe('not paginated', function() {
        var comments,
            getAllUrl,
            response,
            $httpBackend,
            $log,
            $q;

        beforeEach(inject(function (_comments_, _$httpBackend_, _$q_, _$log_) {
            $q = _$q_;
            $log = _$log_;
            response = {
                items: angular.copy(items)
            };
            $httpBackend = _$httpBackend_;

            getAllUrl = Routing.generate(
                'newscoop_gimme_comments_getcommentsforarticle_1',
                {
                    number: 64, language: 'de', order: 'nested',
                    items_per_page: 50, page: 1
                }, true
            );

            $httpBackend.expect('GET', getAllUrl).respond(response);
            comments = _comments_;
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
                    var location = Routing.generate(
                        'newscoop_gimme_comments_getcomment',
                        {id: 26996}, true
                    );

                    comments.add(p);
                    $httpBackend.expect('GET', location).respond({});
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

                it('has a status', function() {
                    expect(comment.status).toBe('approved');
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
                    var $http,
                        $httpBackend;

                    beforeEach(inject(function (_$http_, _$httpBackend_) {
                        var spy;

                        $http = _$http_;
                        $httpBackend = _$httpBackend_;
                        $httpBackend.whenPATCH('/backend').respond(200, {});

                        spy = spyOn(comments.resource, 'toggleRecommended');

                        // Simulate `comments.resource` issuing an HTTP request
                        // in the background and invoking provided success
                        // handler (if any) on asynchronous response.
                        spy.andCallFake(function () {
                            var onSuccess = function () {
                                if (spy.mostRecentCall.args.length >= 3) {
                                    spy.mostRecentCall.args[2]();
                                }
                            };
                            $http({method: 'PATCH', url: '/backend'})
                                .success(onSuccess);
                        });
                    }));

                    it('provides correct arguments to resource', function () {
                        var callArgs;

                        comment.recommended = true;
                        comment.toggleRecommended();

                        callArgs = comments.resource.toggleRecommended
                            .mostRecentCall.args;

                        expect(callArgs.length).toBeGreaterThan(1);
                        expect(callArgs[0]).toEqual({commentId: 24});
                        expect(callArgs[1]).toEqual({
                            comment: {recommended: 0}
                        });
                    });

                    it('toggles "recommended" flag from false to true',
                        function () {
                            comment.recommended = false;
                            comment.toggleRecommended();
                            $httpBackend.flush();
                            expect(comment.recommended).toBe(true);
                    });

                    it('toggles "recommended" flag from true to false',
                        function () {
                            comment.recommended = true;
                            comment.toggleRecommended();
                            $httpBackend.flush();
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
                                var url = Routing.generate(
                                    'newscoop_gimme_comments_updatecomment_1',
                                    {
                                        article: 64, language: 'de',
                                        commentId: 24
                                    }, true
                                );

                                $httpBackend.expect('POST', url)
                                    .respond(200, '');
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

            describe('with selected comments', function() {
                /**
                * Generates API URL for patching a particular comment.
                *
                * @method getPatchUrl
                * @param commentId {Number} ID of the comment to generate
                *   the URL for
                * @return {String} generated URL
                */
                function getPatchUrl(commentId) {
                    var url = Routing.generate(
                        'newscoop_gimme_comments_updatecomment_1',
                        {article: 64, language: 'de', commentId: commentId},
                        true
                    );
                    return url;
                }

                beforeEach(function() {
                    expect(comments.displayed.length).toBe(3);
                    comments.displayed[0].selected = true;
                    comments.displayed[1].selected = true;
                    comments.displayed[2].selected = false;
                });

                describe('changing status', function() {
                    beforeEach(function() {
                        comments.changeSelectedStatus('hidden');
                    });
                    describe('successful responses', function() {
                        beforeEach(function() {
                            $httpBackend.expect(
                                'PATCH',
                                getPatchUrl(24),
                                'comment%5Bstatus%5D=hidden'
                            ).respond(200, '');
                            $httpBackend.expect(
                                'PATCH',
                                getPatchUrl(25),
                                'comment%5Bstatus%5D=hidden'
                            ).respond(200, '');
                            $httpBackend.flush();
                        });
                        it('updates the statuses', function() {
                            expect(comments.displayed[0].status)
                                .toBe('hidden');
                            expect(comments.displayed[1].status)
                                .toBe('hidden');
                            expect(comments.displayed[2].status)
                                .toBe('approved');
                        });
                    });
                    describe('some failures', function() {
                        beforeEach(function() {
                            $httpBackend.expect(
                                'PATCH',
                                getPatchUrl(24),
                                'comment%5Bstatus%5D=hidden'
                            ).respond(200, '');
                            $httpBackend.expect(
                                'PATCH',
                                getPatchUrl(25),
                                'comment%5Bstatus%5D=hidden'
                            ).respond(500, '');
                            $httpBackend.flush();
                        });
                        it('updates some statuses, rollbacks the others', function() {
                            expect(comments.displayed[0].status)
                                .toBe('hidden');
                            expect(comments.displayed[1].status)
                                .toBe('approved');
                            expect(comments.displayed[2].status)
                                .toBe('approved');
                        });
                    });
                });
            });
        });
    });

    describe('paginated', function() {

        /**
        * Generates API URL for retrieving a particular result page of
        * article comments.
        *
        * @method createUrl
        * @param page {Number} number of the results page to request
        * @param [chronological=false] {Boolean} if true, the 'order' URL
        *   parameter is omitted (meaning default 'chronological' order),
        *   otherwise 'nested' ordering is assumed
        * @return {String} generated URL
        */
        function createUrl(page, chronological) {
            var config = {
                number: 64,
                language: 'de',
                order: 'nested',
                items_per_page: 50,
                page: page
            };

            if (chronological) {
                delete config.order;
            }

            return Routing.generate(
                'newscoop_gimme_comments_getcommentsforarticle_1', config, true
            );
        }

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
            $httpBackend.expectGET(createUrl(1)).respond(response);
            $httpBackend.expectGET(createUrl(2)).respond(response);
            comments = _comments_;
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
                $httpBackend.expectGET(createUrl(1, true)).respond({});
                comments.init({
                    sorting: 'chronological'
                });
            });
            it('changes the location', function () {
                $httpBackend.verifyNoOutstandingExpectation();
            });
            describe('if a different sorting is specified again', function() {
                beforeEach(function() {
                    $httpBackend.expectGET(createUrl(1)).respond({});
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
                location = createUrl(3);
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
