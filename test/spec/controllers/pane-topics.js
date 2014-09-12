'use strict';

/**
* Module with tests for the topics pane controller.
*
* @module PaneTopicsCtrl controller tests
*/
describe('Controller: PaneTopicsCtrl', function () {
    var article,
        articleDeferred,
        PaneTopicsCtrl,
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

    it('initializes the list of selected topics in scope to empty list',
        function () {
            expect(scope.selectedTopics).toEqual([]);
        }
    );

    it('initializes the assigningTopics flag in scope to false', function () {
        expect(scope.assigningTopics).toBe(false);
    });

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

    describe('scope\'s clearSelectedTopics() method', function () {
        it('clears the selected topics list', function () {
            scope.selectedTopics = [
                {id: 1, title: 'topic 1'}, {id: 5, title: 'topic 5'}
            ];
            scope.clearSelectedTopics();
            expect(scope.selectedTopics).toEqual([]);
        });
    });

    // TODO: scope's findTopics() method... not finished yet

    describe('scope\'s assignSelectedToArticle() method', function () {
        var deferredAdd,
            topics;

        beforeEach(inject(function ($q) {
            topics = [
                {id: 2, title: 'topic 2'},
                {id: 9, title: 'topic 9'},
            ];

            deferredAdd = $q.defer();
            spyOn(Topic, 'addToArticle').andReturn(deferredAdd.promise);

            article.articleId = 18;
            article.language = 'it';

            scope.selectedTopics = angular.copy(topics);
            scope.assignedTopics = [{id: 4, title: 'topic 4'}];
        }));

        it('sets the assigningTopics flag before doing anything', function () {
            scope.assigningTopics = false;
            scope.assignSelectedToArticle();
            expect(scope.assigningTopics).toBe(true);
        });

        it('invokes the Topic service\'s addToArticle() method with correct ' +
           'parameters',
            function () {
                scope.assignSelectedToArticle();
                expect(Topic.addToArticle).toHaveBeenCalledWith(
                    18, 'it', topics
                );
            }
        );

        it('clears the assigningTopics flag on successful server response',
            function () {
                scope.assignSelectedToArticle();
                scope.assigningTopics = true;  // make sure the flag is set

                deferredAdd.resolve(topics);
                scope.$apply();

                expect(scope.assigningTopics).toBe(false);
            }
        );

        it('clears the assigningTopics flag on server error response',
            function () {
                scope.assignSelectedToArticle();
                scope.assigningTopics = true;  // make sure the flag is set

                deferredAdd.reject('Timeout');
                scope.$apply();

                expect(scope.assigningTopics).toBe(false);
            }
        );

        it('adds added topics to the assignedTopics list on successful ' +
           'server response',
            function () {
                scope.assignSelectedToArticle();

                deferredAdd.resolve(topics);
                scope.$apply();

                expect(scope.assignedTopics).toEqual([
                    {id: 4, title: 'topic 4'},
                    {id: 2, title: 'topic 2'},
                    {id: 9, title: 'topic 9'}
                ]);
            }
        );

        it('clears the selected topics list on successful server response',
            function () {
                scope.assignSelectedToArticle();

                deferredAdd.resolve(topics);
                scope.$apply();

                expect(scope.selectedTopics).toEqual([]);
            }
        );
    });

});
