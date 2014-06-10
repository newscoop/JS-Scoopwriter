'use strict';

/**
* Module with tests for the SnippetTemplate factory.
*
* @module SnippetTemplate factory tests
*/

describe('Factory: SnippetTemplate', function () {

    var SnippetTemplate,
        templates,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_SnippetTemplate_, _$httpBackend_) {
        SnippetTemplate = _SnippetTemplate_;
        $httpBackend = _$httpBackend_;
    }));

    describe('getAll() method', function () {
        beforeEach(function () {
            templates = [
                {id: 10, name: 'tpl 1', fields: {}},
                {id: 20, name: 'tpl 2', fields: {}},
                {id: 30, name: 'tpl 3', fields: {}},
            ];

            $httpBackend.expectGET(
                rootURI + '/snippetTemplates?items_per_page=99999'
            )
            .respond(200, JSON.stringify({ items: templates }));
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        it('sends a correct request to API', function () {
            SnippetTemplate.getAll();
        });

        it('returns an empty array which is populated on successful response',
            function () {
                var result = SnippetTemplate.getAll();
                expect(result instanceof Array).toEqual(true);
                expect(result.length).toEqual(0);

                $httpBackend.flush(1);
                expect(result.length).toEqual(3);
        });

        it('returned array\'s promise is resolved on successful response',
            function () {
                var result,
                    spy = jasmine.createSpy();

                result = SnippetTemplate.getAll();
                result.$promise.then(spy);
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalled();
        });

        describe('on server error response', function () {
            beforeEach(function () {
                $httpBackend.resetExpectations();
                $httpBackend.expectGET(
                    rootURI + '/snippetTemplates?items_per_page=99999'
                )
                .respond(500, 'Server error');
            });

            it('returned array is not populated', function () {
                var result = SnippetTemplate.getAll();
                expect(result.length).toEqual(0);
                $httpBackend.flush(1);
                expect(result.length).toEqual(0);  // still empty
            });

            it('returned array\'s promise is rejected', function () {
                var result,
                    spy = jasmine.createSpy();

                result = SnippetTemplate.getAll();
                result.$promise.catch(function (reason) {
                    spy(reason);
                });
                expect(spy).not.toHaveBeenCalled();

                $httpBackend.flush(1);
                expect(spy).toHaveBeenCalledWith('Server error');
            });
        });

    });

});
