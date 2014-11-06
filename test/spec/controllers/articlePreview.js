'use strict';

/**
* Module with tests for the ArticlePreviewCtrl controller.
*
* @module ArticlePreviewCtrl tests
*/

describe('Controller: ArticlePreviewCtrl', function () {
    var ctrl,
        articleService;

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($controller, article) {
        articleService = article;

        ctrl = $controller('ArticlePreviewCtrl', {
            article: articleService
        });
    }));

});
