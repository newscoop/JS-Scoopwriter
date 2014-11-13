'use strict';

/**
* Module with tests for the article service.
*
* @module article service tests
*/

describe('Service: article', function () {
    var articleService;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (article) {
        articleService = article;
    }));

    it('does not do anything', function () {
        // yes, nothing to test, the service by itself
        // is just an empty container
    });
});
