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
            var aa = Snippet.getAllByArticle(77, 'pl');
        });

        // TODO: test returns "future" object

        // TODO: test populates future object on success

        // TODO: does not populate future object on error

        // TODO: future object has a $promise (check type!)

        // TODO: resolves object.$promise on success

        // TODO: rejects object.$promise on error
    });

});
