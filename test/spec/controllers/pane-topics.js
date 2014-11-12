'use strict';

/**
* Module with tests for the topics pane controller.
*
* @module PaneTopicsCtrl controller tests
*/
describe('Controller: PaneTopicsCtrl', function () {
    var PaneTopicsCtrl,
        scope,
        Topic;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, $rootScope, _article_, _Topic_
    ) {
        var articleService;

        articleService = _article_,
        Topic = _Topic_;

        articleService.articleInstance = {
            articleId: 17,
            language: 'it'
        };

        spyOn(Topic, 'getAllByArticle').andReturn(
            [{id: 1, title: 'foo'}, {id: 4, title: 'bar'}]
        );

        scope = $rootScope.$new();
        PaneTopicsCtrl = $controller('PaneTopicsCtrl', {
            $scope: scope,
            article: articleService,
            Topic: Topic
        });
    }));

    describe('initialization of article topics in scope', function () {
        it('invokes service\'s getAllByArticle() method with correct ' +
           'parameters',
            function () {
                expect(Topic.getAllByArticle).toHaveBeenCalledWith(17, 'it');
            }
        );

        it('exposes retrieved topics in scope', function () {
            expect(scope.assignedTopics).toEqual(
                [{id: 1, title: 'foo'}, {id: 4, title: 'bar'}]
            );
        });
    });

});
