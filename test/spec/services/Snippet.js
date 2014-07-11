'use strict';

/**
* Module with tests for the Snippet factory.
*
* @module Snippet factory tests
*/

describe('Factory: Snippet', function () {

    var Snippet,
        snippets,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_Snippet_, _$httpBackend_) {
        Snippet = _Snippet_;
        $httpBackend = _$httpBackend_;
    }));

    describe('getAllByArticle() method', function () {
        var url;

        beforeEach(function () {
            snippets = [
                {id: 1, name: 'foo 1', code: '<bar 1>'},
                {id: 2, name: 'foo 2', code: '<bar 2>'},
                {id: 3, name: 'foo 3', code: '<bar 3>'},
            ];

            url = Routing.generate(
                'newscoop_gimme_snippets_getsnippetsforarticle_1',
                {
                    number: 77, language: 'pl',
                    items_per_page: 99999, rendered: 'true'
                },
                true
            );

            $httpBackend.expectGET(url)
                .respond(200, JSON.stringify({ items: snippets }));
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Snippet.getAllByArticle(77, 'pl');
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = Snippet.getAllByArticle(77, 'pl');
                expect(result instanceof Array).toEqual(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('returned array\'s promise is resolved on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = Snippet.getAllByArticle(77, 'pl');
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(url).respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = Snippet.getAllByArticle(77, 'pl');
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = Snippet.getAllByArticle(77, 'pl');
                result.$promise.catch(function (reason) {
                    spy(reason);
                });
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalledWith('Server error');
            });
        });
    });


    describe('getById() method', function () {
        var snippetData;

        beforeEach(function () {
            var url = Routing.generate(
                'newscoop_gimme_snippets_getsnippet',
                {snippetId: 42, rendered: true}, true
            );
            snippetData = {id:42};
            $httpBackend.expectGET(url)
                .respond(200, JSON.stringify(snippetData));
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            Snippet.getById(42);
        });

        it('resolves given promise on successful server response',
            function () {
                var expectedArg,
                    spyHelper = {
                        onSuccess: jasmine.createSpy()
                    };

                Snippet.getById(42)
                    .then(spyHelper.onSuccess);
                $httpBackend.flush(1);

                expect(spyHelper.onSuccess).toHaveBeenCalled();
                expectedArg = spyHelper.onSuccess.mostRecentCall.args[0];
                expect(expectedArg instanceof Snippet).toBe(true);
                expect(expectedArg.id).toEqual(42);
            }
        );

        it('rejects given promise on server error response', function () {
            var expectedArg,
                spyHelper = {
                    errorCallback: jasmine.createSpy()
                };

            $httpBackend.resetExpectations();
            $httpBackend.expectGET(rootURI + '/snippets/42?rendered=true')
                .respond(500, 'Error :(');

            Snippet.getById(42)
                .catch(spyHelper.errorCallback);
            $httpBackend.flush(1);

            expect(spyHelper.errorCallback).toHaveBeenCalledWith('Error :(');
        });
    });


    describe('create() method', function () {
        var expectedPostData,
            templateFields,
            urlCreate,
            urlGet;  // contents of the x-location header

        beforeEach(function () {
            templateFields = {foo:'bar', baz:42};

            urlCreate = Routing.generate(
                'newscoop_gimme_snippets_createsnippet', {}, true
            );

            urlGet = 'http://foo.bar/api/snippets/1';

            expectedPostData = JSON.stringify({
                template: 7,
                snippet: {
                    name: 'foo',
                    fields: {
                        'foo': {data: 'bar'},
                        'baz': {data: 42}
                    }
                }
            });

            $httpBackend.expectPOST(urlCreate, expectedPostData)
                .respond(201, '', {'x-location': urlGet});
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API to create a snippet', function () {
            Snippet.create('foo', 7, templateFields);
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = Snippet.create('foo', 7, templateFields)
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('requests created snippet\'s data from API', function () {
            $httpBackend.expectGET(urlGet + '?rendered=true')
                .respond(200, {id: 1});

            Snippet.create('foo', 7, templateFields);
            $httpBackend.flush(1);
        });

        it('resolves promise wiht new Snippet instance on success',
            function () {
                var snippet,
                    successSpy = jasmine.createSpy();

                $httpBackend.expectGET(urlGet + '?rendered=true')
                    .respond(200, {id: 1, templateId: 7, name: 'foo'});

                Snippet.create('foo', 7, templateFields).then(successSpy);

                $httpBackend.flush(2);

                expect(successSpy).toHaveBeenCalled();
                snippet = successSpy.mostRecentCall.args[0];

                expect(snippet instanceof Snippet).toBe(true);
                expect(angular.equals(
                    snippet, { id: 1, templateId: 7, name: 'foo'}
                )).toBe(true);
            }
        );

        it('rejects given promise on snippet creation error', function () {
            var errorSpy,
                promise;

            errorSpy = jasmine.createSpy();

            $httpBackend.resetExpectations();
            $httpBackend.expectPOST(urlCreate).respond(500, 'Server error');

            promise = Snippet.create('foo', 7, templateFields);
            promise.catch(errorSpy);

            $httpBackend.flush(1);
            expect(errorSpy).toHaveBeenCalled();
        });
    });


    describe('addToArticle() method', function () {
        var snippet,
            url;

        beforeEach(function () {
            var expectedLinkHeader,
                snippetUri;

            snippetUri = Routing.generate(
                'newscoop_gimme_snippets_getsnippet', {snippetId: 1}, false
            );
            expectedLinkHeader = '<' + snippetUri + '; rel="snippet">';

            snippet = Object.create(Snippet.prototype, {
                id: {value: 1, writable: true, enumerable: true}
            });

            url = Routing.generate(
                'newscoop_gimme_articles_linkarticle',
                {number: 25, language: 'de'}, true
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

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = snippet.addToArticle(25, 'de')
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('sends a correct request to API', function () {
            snippet.addToArticle(25, 'de');
        });

        it('resolves given promise on successful server response',
            function () {
                var promise,
                    spyHelper = {
                        callMeOnSuccess: jasmine.createSpy()
                    };

                snippet.addToArticle(25, 'de')
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

            snippet.addToArticle(25, 'de')
                .then(null, spyHelper.callMeOnError);

            $httpBackend.flush(1);

            expect(spyHelper.callMeOnError).toHaveBeenCalledWith('Error :(');
        });
    });


    describe('removeFromArticle() method', function () {
        var snippet,
            url;

        beforeEach(function () {
            var expectedLinkHeader,
                snippetUri;

            snippetUri = Routing.generate(
                'newscoop_gimme_snippets_getsnippet', {snippetId: 1}, false
            );
            expectedLinkHeader = '<' + snippetUri + '; rel="snippet">';

            snippet = Object.create(Snippet.prototype, {
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
            promise = snippet.removeFromArticle(25, 'de')
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('sends a correct request to API', function () {
            snippet.removeFromArticle(25, 'en');
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('resolves given promise on successful server response',
            function () {
                var promise,
                    spyHelper = {
                        callMeOnSuccess: jasmine.createSpy()
                    };

                snippet.removeFromArticle(25, 'en')
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

            snippet.removeFromArticle(25, 'en')
                .catch(spyHelper.callMeOnError);
            $httpBackend.flush(1);

            expect(spyHelper.callMeOnError).toHaveBeenCalledWith('Error :(');
        });
    });

});
