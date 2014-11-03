'use strict';

/**
* Module with tests for the info pane controller.
*
* @module PaneInfoCtrl controller tests
*/
describe('Controller: PaneInfoCtrl', function () {
    var articleDeferred,
        PaneInfoCtrl,
        scope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, $rootScope, $q, article
    ) {
        articleDeferred = $q.defer();
        article.promise = articleDeferred.promise;

        scope = $rootScope.$new();
        PaneInfoCtrl = $controller('PaneInfoCtrl', {
            $scope: scope,
            article: article
        });
    }));

    it('exposes article in scope when article data is retrieved', function () {
        expect(scope.article).toBeUndefined();
        articleDeferred.resolve({number: 17, language: 'it'});
        scope.$digest();
        expect(scope.article).toEqual({number: 17, language: 'it'});
    });

});
