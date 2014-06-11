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
                {id: 1, title: 'foo 1', code: '<bar 1>'},
                {id: 2, title: 'foo 2', code: '<bar 2>'},
                {id: 3, title: 'foo 3', code: '<bar 3>'},
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
        var postDataCheck,
            postDataCheckWrapper,
            templateFields;

        beforeEach(function () {
            templateFields = {foo:'bar', baz:42};

            // this can be easily customized in tests if needed
            postDataCheck = function (data) {
                return true;
            };
            postDataCheckWrapper = function (data) {
                return postDataCheck(data);
            };

            $httpBackend.expectPOST(
                rootURI + '/snippets', postDataCheckWrapper
            ).respond(201, '');
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            postDataCheck = function (data) {
                var expected = JSON.stringify({
                    name: 'foo',
                    template: 7,
                    'snippet[fields][][foo]': 'bar',
                    'snippet[fields][][baz]': 42
                });
                return data === expected;
            };
            Snippet.create('foo', 7, templateFields);
        });

        it('returns a promise', inject(function ($q) {
            var deferred = $q.defer(),
                promise;
            promise = Snippet.create('foo', 7, templateFields)
            expect(promise instanceof deferred.promise.constructor).toBe(true);
        }));

        // TODO: resolves promise wiht new Snippet instance on success

        it('rejects given promise on server error', function () {
            var errorSpy,
                promise;

            errorSpy = jasmine.createSpy();

            $httpBackend.resetExpectations();
            $httpBackend.expectPOST(
                rootURI + '/snippets', postDataCheckWrapper
            ).respond(500, 'Server error');

            promise = Snippet.create('foo', 7, templateFields);
            promise.catch(errorSpy);

            $httpBackend.flush(1);
            expect(errorSpy).toHaveBeenCalledWith('Server error');
        });
    });

});
