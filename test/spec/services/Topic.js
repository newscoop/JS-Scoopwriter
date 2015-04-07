'use strict';

/**
* Module with tests for the Topic factory.
*
* @module Topic factory tests
*/

describe('Factory: Topic', function () {

    var Topic,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Topic_, _$httpBackend_) {
        Topic = _Topic_;
        $httpBackend = _$httpBackend_;
    }));


    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            // NOTE: have integers as strings to test data conversion
            data = {
                id: '12',
                title: 'Sports',
                path: ' / Sports',
                parent: '4',
                level: '0',
                order: '1'
            };
        });

        it('returns a Topic instance', function () {
            var instance = Topic.createFromApiData(data);
            expect(instance instanceof Topic).toBe(true);
        });

        it('correctly initializes returned instance\'s attributes',
            function () {
                var instance = Topic.createFromApiData(data);
                expect(instance.id).toEqual(12);
                expect(instance.title).toEqual('Sports');
                expect(instance.path).toEqual(' / Sports');
                expect(instance.parentId).toEqual(4);
                expect(instance.level).toEqual(0);
                expect(instance.order).toEqual(1);
            }
        );

        it('initializes an additional property "text" to topic title',
            function () {
                var instance = Topic.createFromApiData(data);
                expect(instance.text).toEqual('Sports');
            }
        );
    });

    describe('getAll() method', function () {
        var url,
            response;

        beforeEach(function () {
            response = {
                items: [
                    {id: 5, title: 'topic 5'},
                    {id: 2, title: 'topic 2'},
                    {id: 9, title: 'topic 9'}
                ]
            };

            url = Routing.generate(
                'newscoop_gimme_topics_gettopics',
                {language: 'de', items_per_page: 9999}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Topic.getAll('de');
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = Topic.getAll('de');
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAll('de');
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        it('returned array is populated with Topic instances on successful ' +
           'response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAll('de');
                $httpBackend.flush(1);

                result.forEach(function (item) {
                    expect(item instanceof Topic).toBe(true);
                });
            }
        );

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = Topic.getAll('de');
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAll('de');
                result.$promise.catch(function (reason) {
                    spy(reason);
                });
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalledWith('Server error');
            });
        });
    });


    describe('getAllByArticle() method', function () {
        var url,
            response;

        beforeEach(function () {
            response = {
                items: [
                    {id: 5, title: 'topic 5'},
                    {id: 2, title: 'topic 2'},
                    {id: 9, title: 'topic 9'}
                ]
            };

            url = Routing.generate(
                'newscoop_gimme_topics_getarticlestopics',
                {number: 7, language: 'it'}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Topic.getAllByArticle(7, 'it');
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = Topic.getAllByArticle(7, 'it');
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAllByArticle(7, 'it');
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        it('returned array is populated with Topic instances on successful ' +
           'response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAllByArticle(7, 'it');
                $httpBackend.flush(1);

                result.forEach(function (item) {
                    expect(item instanceof Topic).toBe(true);
                });
            }
        );

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = Topic.getAllByArticle(7, 'it');
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAllByArticle(7, 'it');
                result.$promise.catch(function (reason) {
                    spy(reason);
                });
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalledWith('Server error');
            });
        });
    });


    describe('liveSearchQuery() method', function () {
        var $timeout,
            dateFactory,
            options,
            response;

        /**
        * Helper function which modifies dateFactory in a way that
        * makeInstance() returns new Date object representing the given time
        * point.
        *
        * @method setCurrentMockedTime
        * @param timestamp {Number} number of milliseconds since 1st Jan 1970
        */
        function setCurrentMockedTime(timestamp) {
            dateFactory.makeInstance = function () {
                return new Date(timestamp);
            };
        }

        /**
        * Helper function which creates an API request URL.
        *
        * @method createUrl
        * @param page {Number} number of the results page to request
        */
        function createUrl(page) {
            var url =  Routing.generate(
                'newscoop_gimme_topics_searchtopics',
                {items_per_page: 10, page: page, query: 'new'}, true
            );
            return url;
        }

        beforeEach(inject(function (_$timeout_, _dateFactory_) {
            $timeout = _$timeout_;
            dateFactory = _dateFactory_;

            setCurrentMockedTime(0);

            options = {
                page: 1,
                context: null,
                term: 'new',
                callback: function () {}
            };

            spyOn(Topic, 'liveSearchQuery').andCallThrough();

            response = {
                items: [{
                    id: 19,
                     text: 'Topic sports 19'
                }, {
                    id: 68,
                    text: 'Topic news 68'
                }]
            };
        }));

        it('delays non-callback non-pagination calls for 250ms', function () {
            $httpBackend.whenGET(createUrl(1)).respond(200, response);

            Topic.liveSearchQuery(options);

            expect(Topic.liveSearchQuery.callCount).toEqual(1);

            setCurrentMockedTime(249);
            $timeout.flush(249);
            // still not called yet
            expect(Topic.liveSearchQuery.callCount).toEqual(1);

            setCurrentMockedTime(250);
            $timeout.flush(1);
            $timeout.verifyNoPendingTasks();  // only one call to $timeout

            expect(Topic.liveSearchQuery.callCount).toEqual(2);
            expect(Topic.liveSearchQuery.calls[1].args)
                .toEqual([options, true]);
        });

        it('executes non-callback pagination calls w/o delay', function () {
            $httpBackend.expectGET(createUrl(7)).respond(200, response);

            options.page = 7;
            options.context = {
                itemsPerPage: 10,
                currentPage: 6,
                itemsCount: 72,
                nextPageLink: 'foo/bar/?page=7'
            };

            Topic.liveSearchQuery(options);

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it ('ignores duplicate pagination calls', function () {
            $httpBackend.expectGET(createUrl(7)).respond(200, response);

            options.page = 7;
            options.context = {
                itemsPerPage: 10,
                currentPage: 6,
                itemsCount: 72,
                nextPageLink: 'foo/bar/?page=7'
            };

            Topic.liveSearchQuery(options);
            Topic.liveSearchQuery(options);

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it ('ignores callbacks for obsolete search terms', function () {
            // simulate "not enough time elapsed since the last search term
            // change" - should ignore such callbacks
            setCurrentMockedTime(249);
            Topic.liveSearchQuery(options, true);
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('correctly invokes API for up-to-date search terms', function () {
            $httpBackend.expectGET(createUrl(1)).respond(200, response);

            options.page = 1;
            setCurrentMockedTime(1500);

            Topic.liveSearchQuery(options, true);

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('correctly invokes callback on successful server response',
            function () {
                var callbackArgs,
                    response = {},
                    resultItem;

                // test fixtures
                $httpBackend.expectGET(createUrl(1)).respond(200, response);

                response.items = [{id: 68, title: 'Topic news 68'}];
                response.pagination = {
                    itemsPerPage: 10,
                    currentPage: 1,
                    itemsCount: 1,
                    nextPageLink: ''
                };

                spyOn(options, 'callback');
                options.page = 1;
                setCurrentMockedTime(1500);

                // the actual test
                Topic.liveSearchQuery(options, true);
                $httpBackend.flush();

                // assertions
                $httpBackend.verifyNoOutstandingExpectation();

                expect(options.callback.callCount).toEqual(1);
                callbackArgs = options.callback.calls[0].args;
                expect(callbackArgs.length).toEqual(1);

                expect(callbackArgs[0].more).toEqual(false);
                expect(callbackArgs[0].context).toEqual(response.pagination);

                resultItem = callbackArgs[0].results[0];
                expect(resultItem.id).toEqual(68);
                expect(resultItem.text).toEqual('Topic news 68');
            }
        );
    });


    describe('create() method', function () {
        var urlCreate,
            urlGet;  // contents of the x-location header

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

        beforeEach(function () {
            urlCreate = Routing.generate(
                'newscoop_gimme_topics_createtopic', {}, true
            );
            urlGet = 'http://foo.bar/api/topics/8';
        });

        it('sends correct request to API to create a topic ' +
            'with no parent topic',
            function () {
                var expectedPostData = $.param({
                    topic: {
                        title: 'News',
                        locale: 'en'
                    }
                });

                $httpBackend.expectPOST(
                    urlCreate, expectedPostData, headersCheck
                ).respond(201, '', {'x-location': urlGet});

                Topic.create('News', undefined, 'en');

                $httpBackend.verifyNoOutstandingExpectation();
            }
        );

        it('sends correct request to API to create a topic ' +
            'with a parent topic',
            function () {
                var expectedPostData = $.param({
                    topic: {
                        title: 'News',
                        parent: 4,
                        locale: 'en'
                    }
                });

                $httpBackend.expectPOST(
                    urlCreate, expectedPostData, headersCheck
                ).respond(201, '', {'x-location': urlGet});

                Topic.create('News', 4, 'en');

                $httpBackend.verifyNoOutstandingExpectation();
            }
        );

        it('requests created topic\'s data after successful creation',
            function () {
                $httpBackend.whenPOST(/.*/)
                    .respond(201, '', {'x-location': urlGet});
                $httpBackend.expectGET(urlGet).respond(200, '');

                Topic.create('News');
                $httpBackend.flush(1);  // respond only to topic creation

                $httpBackend.verifyNoOutstandingExpectation();
            }
        );

        it('resolves given promise with the new Topic instance on success',
            function () {
                var onSuccessSpy = jasmine.createSpy(),
                    topic,
                    topicData;

                topicData = {
                    id: 4,
                    parent: 4,
                    title: 'News',
                    level: 0,
                    order: 1
                };

                $httpBackend.whenPOST(/.*/)
                    .respond(201, '',  {'x-location': urlGet});
                $httpBackend.whenGET(/.*/).respond(200, topicData);

                Topic.create('News').then(onSuccessSpy);
                $httpBackend.flush();

                expect(onSuccessSpy).toHaveBeenCalled();
                topic = onSuccessSpy.mostRecentCall.args[0];

                expect(topic instanceof Topic).toBe(true);
                expect(topic.id).toEqual(4);
            }
        );

        it('rejects given promise on topic creation error', function () {
            var onErrorSpy = jasmine.createSpy(),
                promise;

            $httpBackend.whenPOST(/.*/).respond(500, 'Server error');

            Topic.create(4).catch(onErrorSpy);

            $httpBackend.flush();
            expect(onErrorSpy).toHaveBeenCalled();
        });

        it('rejects given promise on created topic retrieval error',
            function () {
                var onErrorSpy = jasmine.createSpy(),
                    promise;

                $httpBackend.whenPOST(/.*/)
                    .respond(201, '',  {'x-location': urlGet});
                $httpBackend.whenGET(/.*/).respond(500, 'Server error');

                Topic.create(4).catch(onErrorSpy);

                $httpBackend.flush();
                expect(onErrorSpy).toHaveBeenCalled();
            }
        );
    });


    describe('addToArticle() method', function () {
        var url,
            topics;

        beforeEach(function () {
            var expectedLinkHeader,
                topicUri2,
                topicUri6;

            topics = [
                {id: 2, name: 'topic 2'},
                {id: 6, name: 'topic 6'}
            ];

            topicUri2 = Routing.generate(
                'newscoop_gimme_topics_gettopicbyid', {id: 2}, false
            )
            topicUri6 = Routing.generate(
                'newscoop_gimme_topics_gettopicbyid', {id: 6}, false
            );
            expectedLinkHeader = [
                '<', topicUri2, '; rel="topic">,',
                '<', topicUri6, '; rel="topic">'
            ].join('');

            url = Routing.generate(
                'newscoop_gimme_articles_linkarticle',
                {number: 18, language: 'it'}, true
            );

            $httpBackend.expect(
                'LINK',
                url,
                undefined,
                function (headers) {
                    return headers.link === expectedLinkHeader;
                }
            ).respond(201, '');
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('raises an error if given topics list is empty', function () {
            $httpBackend.resetExpectations();
            expect(function () {
                Topic.addToArticle(18, 'it', []);
            }).toThrow(new Error('Topics list is empty.'));
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = Topic.addToArticle(18, 'it', topics);
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('sends a correct request to API', function () {
            Topic.addToArticle(18, 'it', topics);
        });

        it('resolves given promise on successful server response',
            function () {
                var promise,
                    spyHelper = {
                        callMeOnSuccess: jasmine.createSpy()
                    };

                Topic.addToArticle(18, 'it', topics)
                    .then(spyHelper.callMeOnSuccess);

                $httpBackend.flush(1);

                expect(spyHelper.callMeOnSuccess).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response', function () {
            var promise,
                spyHelper = {
                    callMeOnError: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expect('LINK', url).respond(500, 'Error :(');

            Topic.addToArticle(18, 'it', topics)
                .then(null, spyHelper.callMeOnError);

            $httpBackend.flush(1);

            expect(spyHelper.callMeOnError).toHaveBeenCalledWith('Error :(');
        });
    });


    describe('removeFromArticle() method', function () {
        var topic,
            url;

        beforeEach(function () {
            var expectedLinkHeader,
                topicUri;

            topicUri = Routing.generate(
                'newscoop_gimme_topics_gettopicbyid', {id: 1}, false
            );
            expectedLinkHeader = '<' + topicUri + '; rel="topic">';

            topic = Object.create(Topic.prototype, {
                id: {value: 1, writable: true, enumerable: true}
            });

            url = Routing.generate(
                'newscoop_gimme_articles_unlinkarticle',
                {number: 25, language: 'en'}, true
            );

            $httpBackend.expect(
                'UNLINK',
                url,
                undefined,
                function (headers) {
                    return headers.link === expectedLinkHeader;
                }
            ).respond(204, '');
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = topic.removeFromArticle(25, 'de')
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('sends a correct request to API', function () {
            topic.removeFromArticle(25, 'en');
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('resolves given promise on successful server response',
            function () {
                var promise,
                    spyHelper = {
                        callMeOnSuccess: jasmine.createSpy()
                    };

                topic.removeFromArticle(25, 'en')
                    .then(spyHelper.callMeOnSuccess);
                $httpBackend.flush(1);

                expect(spyHelper.callMeOnSuccess).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response', function () {
            var promise,
                spyHelper = {
                    callMeOnError: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expect('UNLINK', url).respond(500, 'Error :(');

            topic.removeFromArticle(25, 'en')
                .catch(spyHelper.callMeOnError);
            $httpBackend.flush(1);

            expect(spyHelper.callMeOnError).toHaveBeenCalledWith('Error :(');
        });
    });

});
