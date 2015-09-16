'use strict';

/**
* Module with tests for the ArticlesList factory.
*
* @module ArticlesList factory tests
*/

describe('Factory: ArticlesList', function () {

    var ArticlesList,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_ArticlesList_, _$httpBackend_) {
        ArticlesList = _ArticlesList_;
        $httpBackend = _$httpBackend_;
    }));

    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            // NOTE: have integers as strings to test data conversion
            data = {
                id: '12',
                title: 'Sports',
                notes: 'Sports Notes',
                maxItems: '4',
                text: 'Sports'
            };
        });

        it('returns a ArticlesList instance', function () {
            var instance = ArticlesList.createFromApiData(data);
            expect(instance instanceof ArticlesList).toBe(true);
        });

        it('correctly initializes returned instance\'s attributes',
            function () {
                var instance = ArticlesList.createFromApiData(data);
                expect(instance.id).toEqual(12);
                expect(instance.title).toEqual('Sports');
                expect(instance.notes).toEqual('Sports Notes');
                expect(instance.maxItems).toEqual(4);
                expect(instance.text).toEqual('Sports');
            }
        );

        it('initializes an additional property "text" to articlesList title',
            function () {
                var instance = ArticlesList.createFromApiData(data);
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
                    {id: 5, title: 'articlesList 5'},
                    {id: 2, title: 'articlesList 2'},
                    {id: 9, title: 'articlesList 9'}
                ]
            };

            url = Routing.generate(
                'newscoop_gimme_articles_lists_getlist',
                {language: 'de', items_per_page: 9999}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            ArticlesList.getAll('de');
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = ArticlesList.getAll('de');
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = ArticlesList.getAll('de');
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        it('returned array is populated with ArticlesList instances on successful ' +
           'response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = ArticlesList.getAll('de');
                $httpBackend.flush(1);

                result.forEach(function (item) {
                    expect(item instanceof ArticlesList).toBe(true);
                });
            }
        );

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = ArticlesList.getAll('de');
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = ArticlesList.getAll('de');
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
                    {id: 5, title: 'articlesList 5'},
                    {id: 2, title: 'articlesList 2'},
                    {id: 9, title: 'articlesList 9'}
                ]
            };

            url = Routing.generate(
                'newscoop_gimme_articles_getarticle_language_playlists',
                {number: 7, language: 'it'}, true
            );

            $httpBackend.expectGET(url).respond(200, response);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            ArticlesList.getAllByArticle(7, 'it');
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = ArticlesList.getAllByArticle(7, 'it');
                expect(result instanceof Array).toBe(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('resolves returned array\'s promise on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = ArticlesList.getAllByArticle(7, 'it');
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        it('returned array is populated with ArticlesList instances on successful ' +
           'response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = ArticlesList.getAllByArticle(7, 'it');
                $httpBackend.flush(1);

                result.forEach(function (item) {
                    expect(item instanceof ArticlesList).toBe(true);
                });
            }
        );

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = ArticlesList.getAllByArticle(7, 'it');
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = ArticlesList.getAllByArticle(7, 'it');
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
                'newscoop_gimme_articles_lists_getlist',
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

            spyOn(ArticlesList, 'liveSearchQuery').andCallThrough();

            response = {
                items: [{
                    id: 19,
                     text: 'ArticlesList sports 19'
                }, {
                    id: 68,
                    text: 'ArticlesList news 68'
                }]
            };
        }));

        it('delays non-callback non-pagination calls for 250ms', function () {
            $httpBackend.whenGET(createUrl(1)).respond(200, response);

            ArticlesList.liveSearchQuery(options);

            expect(ArticlesList.liveSearchQuery.callCount).toEqual(1);

            setCurrentMockedTime(249);
            $timeout.flush(249);
            // still not called yet
            expect(ArticlesList.liveSearchQuery.callCount).toEqual(1);

            setCurrentMockedTime(250);
            $timeout.flush(1);
            $timeout.verifyNoPendingTasks();  // only one call to $timeout

            expect(ArticlesList.liveSearchQuery.callCount).toEqual(2);
            expect(ArticlesList.liveSearchQuery.calls[1].args)
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

            ArticlesList.liveSearchQuery(options);

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

            ArticlesList.liveSearchQuery(options);
            ArticlesList.liveSearchQuery(options);

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it ('ignores callbacks for obsolete search terms', function () {
            // simulate "not enough time elapsed since the last search term
            // change" - should ignore such callbacks
            setCurrentMockedTime(249);
            ArticlesList.liveSearchQuery(options, true);
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('correctly invokes API for up-to-date search terms', function () {
            $httpBackend.expectGET(createUrl(1)).respond(200, response);

            options.page = 1;
            setCurrentMockedTime(1500);

            ArticlesList.liveSearchQuery(options, true);

            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('correctly invokes callback on successful server response',
            function () {
                var callbackArgs,
                    response = {},
                    resultItem;

                // test fixtures
                $httpBackend.expectGET(createUrl(1)).respond(200, response);

                response.items = [{id: 68, title: 'ArticlesList news 68'}];
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
                ArticlesList.liveSearchQuery(options, true);
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
                expect(resultItem.text).toEqual('ArticlesList news 68');
            }
        );
    });


    describe('addToArticle() method', function () {
        var url,
            articlesLists;

        beforeEach(function () {
            var expectedLinkHeader,
                articleUri18;

            articlesLists = [
                {id: 6, name: 'articlesList 6'}
            ];

            articleUri18 = Routing.generate(
                'newscoop_gimme_articles_getarticle', 
                {number: 18, language: 'it'}, false
            )
            expectedLinkHeader = {
                "link":"<" + articleUri18 + "; rel=\"article\">",
                "Accept":"application/json, text/plain, */*"
            }

            url = Routing.generate(
                'newscoop_gimme_articles_lists_linkarticle',
                {id: 6}, true
            );

            $httpBackend.expect(
                'LINK',
                url,
                undefined,
                expectedLinkHeader
            ).respond(201, '');
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('raises an error if given articlesLists list is empty', function () {
            $httpBackend.resetExpectations();
            expect(function () {
                ArticlesList.addToArticle(18, 'it', []);
            }).toThrow(new Error('ArticlesLists list is empty.'));
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = ArticlesList.addToArticle(18, 'it', articlesLists);
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('sends a correct request to API', function () {
            ArticlesList.addToArticle(18, 'it', articlesLists);
        });

        it('resolves given promise on successful server response',
            function () {
                var promise,
                    spyHelper = {
                        callMeOnSuccess: jasmine.createSpy()
                    };

                ArticlesList.addToArticle(18, 'it', articlesLists)
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

            ArticlesList.addToArticle(18, 'it', articlesLists)
                .then(null, spyHelper.callMeOnError);

            $httpBackend.flush(1);

            expect(spyHelper.callMeOnError).toHaveBeenCalledWith('Error :(');
        });
    });


    describe('removeFromArticle() method', function () {
        var articlesList,
            url;

        beforeEach(function () {
            var expectedLinkHeader,
                articleUri25;

            articleUri25 = Routing.generate(
                'newscoop_gimme_articles_getarticle',
                {number: 25, language: 'en'}, false
            );
            expectedLinkHeader = {
                "link":"<" + articleUri25 + "; rel=\"article\">",
                "Accept":"application/json, text/plain, */*"
            }
;
            url = Routing.generate(
                'newscoop_gimme_articles_lists_unlinkarticle',
                {id: 1},
                true
            );

            $httpBackend.expect(
                'UNLINK',
                url,
                undefined,
                expectedLinkHeader
            ).respond(204, '');
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                articlesList = ArticlesList.createFromApiData({ id: 1 }),
                promise;
            promise = articlesList.removeFromArticle(25, 'de', articlesList)
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('sends a correct request to API', function () {
            var articlesList = ArticlesList.createFromApiData({ id: 1 });
            articlesList.removeFromArticle(25, 'en', articlesList);
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('resolves given promise on successful server response',
            function () {
                var promise,
                    articlesList = ArticlesList.createFromApiData({ id: 1 }),
                    spyHelper = {
                        callMeOnSuccess: jasmine.createSpy()
                    };

                articlesList.removeFromArticle(25, 'en', articlesList)
                    .then(spyHelper.callMeOnSuccess);
                $httpBackend.flush(1);

                expect(spyHelper.callMeOnSuccess).toHaveBeenCalled();
            }
        );

        it('rejects given promise on server error response', function () {
            var promise,
                articlesList = ArticlesList.createFromApiData({ id: 1 }),
                spyHelper = {
                    callMeOnError: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expect('UNLINK', url).respond(500, 'Error :(');

            articlesList.removeFromArticle(25, 'en', articlesList)
                .catch(spyHelper.callMeOnError);
            $httpBackend.flush(1);

            expect(spyHelper.callMeOnError).toHaveBeenCalledWith('Error :(');
        });
    });

});
