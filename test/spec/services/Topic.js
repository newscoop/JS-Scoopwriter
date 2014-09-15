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
            data = {id: 5, title: 'Sports'};
        });

        it('returns a Topic instance', function () {
            var instance = Topic.createFromApiData(data);
            expect(instance instanceof Topic).toBe(true);
        });

        it('correctly initializes returned instance\'s attributes',
            function () {
                var instance = Topic.createFromApiData(data);
                expect(instance.id).toEqual(5);
                expect(instance.title).toEqual('Sports');
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
                {items_per_page: 9999}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Topic.getAll();
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = Topic.getAll();
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAll();
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

                result = Topic.getAll();
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
                var result = Topic.getAll();
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = Topic.getAll();
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
                'newscoop_gimme_topics_gettopicbyid', {topicId: 2}, false
            )
            topicUri6 = Routing.generate(
                'newscoop_gimme_topics_gettopicbyid', {topicId: 6}, false
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

            // topicUri = Routing.generate(
            //     'newscoop_gimme_topics_gettopic', {topicId: 1}, false
            // );
            topicUri = '/content-api/topics/1';
            expectedLinkHeader = '<' + topicUri + '; rel="topic">';

            topic = Object.create(Topic.prototype, {
                id: {value: 1, writable: true, enumerable: true}
            });

            url = Routing.generate(
                'newscoop_gimme_articles_linkarticle',
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
