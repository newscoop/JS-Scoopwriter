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
                .respond(500, '');
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
                result.$promise.catch(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
            });
        });

    });

});
