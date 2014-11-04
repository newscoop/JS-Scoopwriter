'use strict';

/**
* Module with tests for the switches pane controller.
*
* @module PaneSwitchesCtrl controller tests
*/
describe('Controller: PaneSwitchesCtrl', function () {
    var articleDeferred,
        PaneSwitchesCtrl,
        $q;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($controller, _$q_, _article_) {
        var article = _article_;

        $q = _$q_;

        articleDeferred = $q.defer();
        article.promise = articleDeferred.promise;

        PaneSwitchesCtrl = $controller('PaneSwitchesCtrl', {
            article: article
        });
    }));

    describe('TODO', function () {

    });

});
