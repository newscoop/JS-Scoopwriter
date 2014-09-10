'use strict';

/**
* Module with tests for the topics pane controller.
*
* @module PaneTopicsCtrl controller tests
*/
describe('Controller: PaneTopicsCtrl', function () {
    var articleDeferred,
        PaneTopicsCtrl,
        scope,
        Topic,
        $q;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, $rootScope, _$q_, _article_, _Topic_
    ) {
        var article;

        article = _article_,
        Topic = _Topic_;
        $q = _$q_;

        articleDeferred = $q.defer();
        article.promise = articleDeferred.promise;

        scope = $rootScope.$new();
        PaneTopicsCtrl = $controller('PaneTopicsCtrl', {
            $scope: scope,
            article: article,
            Topic: Topic
        });
    }));

    describe('initialization of article topics in scope', function () {
        var topics;

        beforeEach(function () {
            topics = [];
            spyOn(Topic, 'getAllByArticle').andCallFake(function () {
                return topics;
            });
        });

        it('invokes service\'s getAllByArticle() method with correct ' +
           'parameters',
            function () {
                articleDeferred.resolve({number: 17, language: 'it'});
                scope.$digest();
                expect(Topic.getAllByArticle).toHaveBeenCalledWith(17, 'it');
            }
        );

        it('exposes retrieved topics in scope', function () {
            topics = [{id: 1, title: 'foo'}, {id: 4, title: 'bar'}];
            articleDeferred.resolve({number: 17, language: 'it'});
            scope.$digest();

            expect(scope.assignedTopics).toEqual(
                [{id: 1, title: 'foo'}, {id: 4, title: 'bar'}]
            );
        });
    });

});
