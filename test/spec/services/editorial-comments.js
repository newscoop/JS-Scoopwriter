'use strict';

/**
* Module with tests for the editorial comments service.
*
* @module Editorial Comments service tests
*/

describe('Service: editorialComments', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    var items = [{
            id: 24,
            user: {
                image: "http://example.com/avatar.png",
                username: "Jhon"
            },
            comment: 'I approve this choice, and I do congratulate. Cheers!',
            created: '2013-05-02T10:11:13+0200',
            resolved: 0
        }, {
            id: 25,
            user: {
                image: "http://example.com/avatar.png",
                username: "Jhon"
            },
            comment: 'no screw that!',
            created: '2013-05-02T10:13:28+0200',
            resolved: 0,
            parent: {
                id: 24,
                user: {
                    image: "http://example.com/avatar.png",
                    username: "Jhon"
                },
                comment: 'I approve this choice, and I do congratulate. Cheers!',
                created: '2013-05-02T10:11:13+0200',
                resolved: 0
            }
        }, {
            id: 58,
            user: {
                image: "http://example.com/avatar.png",
                username: "Stan"
            },
            comment: 'adfhadhg',
            created: '2014-03-04T14:37:55+0100',
            resolved: 0
        }
    ];

    beforeEach(module(function ($provide) {
        // create a fake article service to inject around into other services
        var articleServiceMock = {
            articleInstance: {articleId: 64, language: 'de', languageData: {id: 1}}
        };
        $provide.value('article', articleServiceMock);
    }));

    describe('not paginated', function() {
        var comments,
            getAllUrl,
            response,
            $httpBackend,
            $log,
            $q;

        beforeEach(inject(function (_editorialComments_, _$httpBackend_, _$q_, _$log_) {
            $q = _$q_;
            $log = _$log_;
            response = {
                items: angular.copy(items)
            };
            $httpBackend = _$httpBackend_;

            getAllUrl = Routing.generate(
                'newscoop_gimme_articles_get_editorial_comments',
                {
                    number: 64, language: 'de', order: 'nested',
                    items_per_page: 50, page: 1
                }, true
            );

            $httpBackend.expectGET(getAllUrl).respond(200, response);
            comments = _editorialComments_;
            comments.init();
        }));

        describe('init() function', function () {
            var deferred;

            beforeEach(inject(function ($q) {
                deferred = $q.defer();
                spyOn(comments, 'getAllByPage').andCallFake(function () {
                    return deferred.promise;
                });
            }));

            it('init() resets everything to default values', function () {
                comments.canLoadMore = true;
                comments.loaded.push(items[0], items[1]);
                comments.displayed.push(items[0]);
                comments.fetched.push(items[0]);

                comments.init();

                expect(comments.canLoadMore).toBe(false);
                expect(comments.loaded.length).toBe(0);
                expect(comments.displayed.length).toBe(1);
                expect(comments.fetched.length).toBe(0);
                expect(comments.tracker.next()).toBe(2);
            });

            describe('on error', function () {
                var $rootScope;

                beforeEach(inject(function (_$rootScope_) {
                    $rootScope = _$rootScope_;
                }));

                it('rejects given promise on comment creation error', function () {
                    comments.init();
                    deferred.reject();
                    $rootScope.$apply();
                    expect(comments.getAllByPage).toHaveBeenCalled();
                });
            });

        });

        describe('server answered', function() {
            beforeEach(function() {
                $httpBackend.flush();
            });

            /**
            * Helper function for verifying if Content-Type request header is
            * correctly set.
            *
            * @function headersCheck
            * @param headers {Object} request headers
            * @return {Boolean} true if check passes, false otherwise
            */
            function headersCheck(headers) {
                return headers['Content-Type'] ===
                    'application/x-www-form-urlencoded';
            }

            it('has comments', function () {
                expect(comments.displayed.length).toBe(3);
            });

            it('cannot load more', function() {
                expect(comments.canLoadMore).toBe(false);
            });

            describe('comment created', function() {
                var urlCreate,
                    urlGet;

                var parameters = {
                    editorial_comment: {
                        comment: 'message'
                    }
                };

                beforeEach(function() {
                    urlCreate = Routing.generate(
                        'newscoop_gimme_articles_create_editorial_comment',
                        {
                            number: 64,
                            language: 1
                        },
                        true
                    );

                    urlGet = 'http://foo.bar/api/articles/64/en/editorial_comments/8';
                });

                it('creates a comment', function() {
                    $httpBackend.expectPOST(
                        urlCreate, $.param(parameters), headersCheck
                    ).respond(201, '', {'x-location': urlGet});

                    comments.add(parameters);

                    $httpBackend.verifyNoOutstandingExpectation();
                });

                it('validates submitted parameters', function() {
                    $httpBackend.expectPOST(
                        urlCreate, $.param(parameters), headersCheck
                    ).respond(201, '', {'x-location': urlGet});

                    comments.add(parameters);
                    expect(parameters.editorial_comment.comment).toBeDefined();
                    $httpBackend.verifyNoOutstandingExpectation();
                });

                it('sends correct request to API to create a comment ' +
                    'with a parent comment',
                    function () {
                        parameters.editorial_comment.parent = 1;

                        $httpBackend.expectPOST(
                            urlCreate, $.param(parameters), headersCheck
                        ).respond(201, '', {'x-location': urlGet});

                        comments.add(parameters);

                        $httpBackend.verifyNoOutstandingExpectation();
                    }
                );

                it('adds the comment on success', function() {
                    $httpBackend.whenPOST(/.*/)
                        .respond(201, '', {'x-location': urlGet});
                    $httpBackend.expectGET(urlGet).respond({});

                    comments.add(parameters);
                    $httpBackend.flush();

                    expect(comments.displayed.length).toBe(4);
                });



               it('calls init() when no X-Location header', function() {
                    spyOn(comments, 'init');
                    $httpBackend.expectPOST(
                        urlCreate, $.param(parameters), headersCheck
                    ).respond(201, '', '');

                    expect(comments.init.callCount).toBe(0);
                    comments.add(parameters);
                    $httpBackend.flush();
                    expect(comments.init.callCount).toBe(1);
                });

               it('rejects given promise on comment creation error', function () {
                    var onErrorSpy = jasmine.createSpy();

                    $httpBackend.whenPOST(/.*/).respond(500, 'Server error');

                    comments.add(parameters).catch(onErrorSpy);

                    $httpBackend.flush();
                    expect(onErrorSpy).toHaveBeenCalled();
                });
            });

            describe('a single comment', function() {
                var deferred,
                    comment;

                beforeEach(inject(function ($q) {
                    deferred = $q.defer();
                    comment = comments.displayed[0];
                }));

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

                it('resolving flag is not set by default', function () {
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

                it('"resolved" flag is a Boolean', function () {
                    expect(typeof comment.resolved).toBe('boolean');
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
                    beforeEach(function () {
                        comment.reply.comment = 'reply message';
                        spyOn(comments, 'add').andCallFake(function () {
                            return deferred.promise;
                        });
                    });

                    it('sets sendingReply flag', function () {
                        comment.sendingReply = false;
                        comment.sendReply();
                        expect(comment.sendingReply).toBe(true);
                    });

                    it('checks if add() has been called', function () {
                        comment.sendReply();
                        expect(comments.add).toHaveBeenCalled();
                    });


                    describe('on success', function () {
                        var $rootScope;

                        beforeEach(inject(function (_$rootScope_) {
                            $rootScope = _$rootScope_;
                        }));

                        it('clears sendingReply flag', function () {
                            comment.sendingReply = true;
                            comment.sendReply();
                            deferred.resolve(comment.reply);
                            $rootScope.$apply();

                            expect(comment.sendingReply).toBe(false);
                        });

                        it('exits from reply-to mode when no parent defined', function () {
                            comment = comments.displayed[2];
                            comment.isReplyMode = true;
                            comment.sendReply();
                            deferred.resolve();
                            $rootScope.$apply();

                            expect(comment.isReplyMode).toBe(false);
                        });

                        it('exits from reply-to mode when parent defined', function () {
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

                            expect(comment.reply.comment).toBe('');
                        });
                    });

                    describe('on error', function () {
                        var $rootScope;

                        beforeEach(inject(function (_$rootScope_) {
                            $rootScope = _$rootScope_;
                        }));

                        it('rejects given promise on comment creation error', function () {
                            comment.sendReply();
                            deferred.reject();
                            $rootScope.$apply();
                            expect(comments.add).toHaveBeenCalled();
                        });
                    });
                });

                describe('toggleResolved() method', function () {
                    var url,
                        $rootScope;

                    beforeEach(inject(function (_$rootScope_) {
                        $rootScope = _$rootScope_;
                        url = Routing.generate(
                            'newscoop_gimme_articles_edit_editorial_comment',
                            {
                                number: 64,
                                language: 1,
                                commentId: comment.id
                            },
                            true
                        );
                    }));

                    it('sets resolving flag', function () {
                        comment.resolving = false;
                        comment.toggleResolved();
                        expect(comment.resolving).toBe(true);
                    });

                    it('makes an API call to resolve comment', function() {
                        var parameters = {
                            editorial_comment: {
                                resolved: true
                            }
                        };

                        $httpBackend.expectPOST(
                            url, $.param(parameters), headersCheck
                        ).respond(200);

                        comment.toggleResolved();

                        $httpBackend.verifyNoOutstandingExpectation();
                    });

                    it('removes comment from array of comments', function() {
                        var parameters = {
                            editorial_comment: {
                                resolved: true
                            }
                        };

                        $httpBackend.expectPOST(
                            url, $.param(parameters), headersCheck
                        ).respond(200);

                        comment.toggleResolved();
                        $httpBackend.flush();

                        expect(comment.resolving).toBe(false);
                    });

                    it('rejects given promise on comment resolve error', function () {
                        var onErrorSpy = jasmine.createSpy();

                        $httpBackend.whenPOST(/.*/).respond(500, 'Server error');

                        comment.toggleResolved().catch(onErrorSpy);

                        $httpBackend.flush();
                        expect(onErrorSpy).toHaveBeenCalled();
                    });
                });

                describe('save() method', function () {
                    var url,
                        parameters,
                        $rootScope;

                    parameters = {
                        editorial_comment: {
                            comment: 'edited msg'
                        }
                    };

                    beforeEach(inject(function (_$rootScope_) {
                        $rootScope = _$rootScope_;
                        url = Routing.generate(
                            'newscoop_gimme_articles_edit_editorial_comment',
                            {
                                number: 64,
                                language: 1,
                                commentId: comment.id
                            },
                            true
                        );

                        comment.editing.comment = 'edited msg';
                    }));

                    it('makes an API call to save a comment', function() {
                        $httpBackend.expectPOST(
                            url, $.param(parameters), headersCheck
                        ).respond(200);

                        expect(comment.editing.comment).toEqual('edited msg');
                        comment.save();
                        $httpBackend.flush();

                        $httpBackend.verifyNoOutstandingExpectation();
                    });

                    it('sets a peroper values on success', function() {
                        $httpBackend.expectPOST(
                            url, $.param(parameters), headersCheck
                        ).respond(200);

                        comment.save();
                        $httpBackend.flush();
                        expect(comment.comment).toEqual('edited msg');
                        expect(comment.isEdited).toBe(false);

                        $httpBackend.verifyNoOutstandingExpectation();
                    });

                    it('rejects given promise on comment save error', function () {
                        var onErrorSpy = jasmine.createSpy();

                        $httpBackend.whenPOST(/.*/).respond(500, 'Server error');

                        comment.save().catch(onErrorSpy);

                        $httpBackend.flush();
                        expect(onErrorSpy).toHaveBeenCalled();
                    });
                });

                describe('being edited', function() {
                    beforeEach(function() {
                        comment.edit();
                    });

                    it('updates its editing content', function() {
                        expect(comment.editing.comment).toBe(
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
                            comment.editing.comment = 'edited message';
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
                                    expect(comment.editing.comment).toBe(
                                        'I approve this choice, and I do ' +
                                        'congratulate. Cheers!'
                                    );
                                });
                            });
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
        function createUrl(page, itemsPerPage) {
            var config = {
                number: 64,
                language: 'de',
                order: 'nested',
                items_per_page: itemsPerPage,
                page: page
            };

            return Routing.generate(
                'newscoop_gimme_articles_get_editorial_comments', config, true
            );
        }

        var response, comments, $httpBackend;
        beforeEach(inject(function (_editorialComments_, _$httpBackend_, _article_) {
            response = {
                items: items,
                "pagination":{
                    "itemsPerPage":50,
                    "currentPage":1,
                    "itemsCount":149735
                }
            };
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET(createUrl(1, 50)).respond(response);
            $httpBackend.expectGET(createUrl(2, 3)).respond(response);
            comments = _editorialComments_;
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

        describe('requesting new comments', function() {
            var location;

            it('immediately shows the three loaded comments, gets more, ' +
                'if does not exist, cannot load more ',
                function() {
                    location = createUrl(2, 6);
                    $httpBackend.expectGET(location).respond({ items: []});
                    comments.more();
                    $httpBackend.flush();
                    $httpBackend.verifyNoOutstandingExpectation();
                    expect(comments.canLoadMore).toBe(false);
                    expect(comments.loaded.length).toBe(0);
                    expect(comments.displayed.length).toBe(6);
            });

            it('immediately shows the three loaded comments, gets more if ' +
                ' exist and adds to loaded array',
                function() {
                    location = createUrl(2, 6);
                    $httpBackend.expectGET(location).respond(response);
                    comments.more();
                    expect(comments.canLoadMore).toBe(true);
                    expect(comments.loaded.length).toBe(0);
                    expect(comments.displayed.length).toBe(6);
            });

            it('logs an error when there are no more comments to load',
                inject(function ($log) {
                    var callArgs,
                        errorMethod = spyOn($log, 'error');

                    comments.canLoadMore = false;
                    location = createUrl(2, 6);
                    $httpBackend.expectGET(location).respond(response);
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
                    location = createUrl(2, 6);
                    $httpBackend.expectGET(location).respond(response);
                    comments.more();
                    $httpBackend.flush();
                    expect(comments.loaded.length).toBe(3);
                    expect(comments.displayed.length).toBe(6);
                });

                it('on error the requested comments page is removed',
                    function () {
                        var removeMethod = spyOn(comments.tracker, 'remove');
                        location = createUrl(2, 6);
                        $httpBackend.expectGET(location).respond(response);
                        $httpBackend.resetExpectations();
                        $httpBackend.expectGET(location).respond(500, '');

                        comments.more();
                        $httpBackend.flush();

                        expect(removeMethod.callCount).toBe(1);
                        expect(removeMethod).toHaveBeenCalledWith(2);
                });
            });
        });
    });
});
