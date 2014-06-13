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
        beforeEach(function () {
            snippets = [
                {id: 1, name: 'foo 1', code: '<bar 1>'},
                {id: 2, name: 'foo 2', code: '<bar 2>'},
                {id: 3, name: 'foo 3', code: '<bar 3>'},
            ];

            $httpBackend.expectGET(
                rootURI + '/snippets/article/77/pl?items_per_page=99999'
            )
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
                $httpBackend.expectGET(
                    rootURI + '/snippets/article/77/pl?items_per_page=99999'
                )
                .respond(500, 'Server error');
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

    describe('create() method', function () {
        var reqCheckers = {},  // http request checker functions
            templateFields;

        beforeEach(function () {
            templateFields = {foo:'bar', baz:42};

            reqCheckers.postDataCheck = function (data) {
                return true;
            };

            reqCheckers.headersCheck = function (headers) {
                return true;
            };

            $httpBackend.expectPOST(
                rootURI + '/snippets',
                function (data) {
                    return reqCheckers.postDataCheck(data);
                },
                function (headers) {
                    return reqCheckers.headersCheck(headers);
                }
            ).respond(201, '', {'x-location': '/api/snippets/1'});
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API to create a snippet', function () {
            reqCheckers.postDataCheck = function (data) {
                var expected = $.param({
                    'snippet[name]': 'foo',
                    'template': 7,
                    'snippet[fields][foo][data]': 'bar',
                    'snippet[fields][baz][data]': 42
                });
                return data === expected;
            };

            reqCheckers.headersCheck = function (headers) {
                return headers['Content-Type'] ===
                    'application/x-www-form-urlencoded';
            };

            Snippet.create('foo', 7, templateFields);
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = Snippet.create('foo', 7, templateFields)
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        it('requests created snippet\'s data from API', function () {
            $httpBackend.expectGET('/api/snippets/1')
                .respond(200, {id: 1});

            Snippet.create('foo', 7, templateFields);
            $httpBackend.flush(1);
        });

        it('resolves promise wiht new Snippet instance on success',
            function () {
                var snippet,
                    successSpy = jasmine.createSpy();

                $httpBackend.expectGET('/api/snippets/1')
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
            $httpBackend.expectPOST(rootURI + '/snippets')
                .respond(500, 'Server error');

            promise = Snippet.create('foo', 7, templateFields);
            promise.catch(errorSpy);

            $httpBackend.flush(1);
            expect(errorSpy).toHaveBeenCalled();
        });
    });

    // TODO: addToArticle() method

});
