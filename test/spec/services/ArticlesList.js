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
            };

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
