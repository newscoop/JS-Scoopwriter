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
        // TODO: just like in SnippetTemplate tests
    });

    describe('getAll() method', function () {
        // TODO: just like in SnippetTemplate tests
    });

});
