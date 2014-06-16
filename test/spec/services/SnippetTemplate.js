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


    describe('createFromApiData() method', function () {
        var data;

        beforeEach(function () {
            data = {
                id: 42, name: 'YouTube', favourite: false, enabled: true,
                fields: {
                    URL: {
                        name: 'URL',
                        type: 'url',
                        scope: 'frontend',
                        required: true
                    }
                }
            };
        });

        it('creates SnippetTemplate instance from data object',
            function () {
                var instance = SnippetTemplate.createFromApiData(data);

                expect(instance instanceof SnippetTemplate).toEqual(true);
                expect(instance.id).toEqual(42);
                expect(instance.name).toEqual('YouTube');
                expect(instance.favourite).toEqual(false);
                expect(instance.enabled).toEqual(true);
                expect(instance.fields).toEqual([data.fields.URL]);
            }
        );

        it('skips non-frontend fields in data',
            function () {
                var instance;

                data.fields.foo = {
                    name: 'foo',
                    type: 'integer',
                    scope: 'backend',
                    required: false
                };

                instance = SnippetTemplate.createFromApiData(data);
                expect(instance.fields).toEqual([data.fields.URL]);
            }
        );
    });

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
