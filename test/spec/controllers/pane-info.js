'use strict';

/**
* Module with tests for the info pane controller.
*
* @module PaneInfoCtrl controller tests
*/
describe('Controller: PaneInfoCtrl', function () {
    var PaneInfoCtrl;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(
        function ($controller, article) {
            article.articleInstance = {number: 17, language: 'it'};
            PaneInfoCtrl = $controller('PaneInfoCtrl', {
                article: article
            });
        }
    ));

    it('exposes the article object', function () {
        expect(PaneInfoCtrl.article).toEqual({number: 17, language: 'it'});
    });
});
