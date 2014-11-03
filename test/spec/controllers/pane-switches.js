'use strict';

/**
* Module with tests for the switches pane controller.
*
* @module PaneSwitchesCtrl controller tests
*/
describe('Controller: PaneSwitchesCtrl', function () {
    var articleDeferred,
        PaneSwitchesCtrl,
        scope,
        $q;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, $rootScope, _$q_, _article_
    ) {
        var article;

        article = _article_,
        $q = _$q_;

        articleDeferred = $q.defer();
        article.promise = articleDeferred.promise;

        scope = $rootScope.$new();
        PaneSwitchesCtrl = $controller('PaneSwitchesCtrl', {
            $scope: scope,
            article: article
        });
    }));

    describe('TODO', function () {

    });

});
