'use strict';

/**
* Module with tests for the topics pane controller.
*
* @module PaneTopicsCtrl controller tests
*/
describe('Controller: PaneTopicsCtrl', function () {
    var article,
        articleDeferred,
        articleService,
        PaneTopicsCtrl,
        scope,
        Topic;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, $rootScope, _article_, _Topic_
    ) {
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

    describe('scope\'s findTopics() method', function () {
        var deferredGetAll,
            allTopics;

        beforeEach(inject(function ($q) {
            allTopics = [
                {id: 2, title: 'Motor Sports'},
                {id: 9, title: 'Water Sports'},
                {id: 3, title: 'Politics'},
                {id: 5, title: 'FooSportBaz'},
                {id: 1, title: 'Local News'},
                {id: 8, title: 'Economy'}
            ];

            deferredGetAll = $q.defer();
            allTopics.$promise = deferredGetAll.promise;
            spyOn(Topic, 'getAll').andReturn(allTopics);

            scope.selectedTopics = [];
            scope.assignedTopics = [];
        }));

        it('returns a promise', inject(function ($q) {
            var promiseConstructor = $q.defer().promise.constructor,
                promise = scope.findTopics('foo');
            expect(promise instanceof promiseConstructor).toBe(true);
        }));

        it('resolves given promise with found topics list', function () {
            var promise = scope.findTopics('litic'),
                onSuccessSpy = jasmine.createSpy();

            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith(
                [{id: 3, title: 'Politics'}]
            );
        });

        it('performs a case-insensitive search', function () {
            var promise = scope.findTopics('SpoRt'),
                onSuccessSpy = jasmine.createSpy();

            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith([
                {id: 2, title: 'Motor Sports'},
                {id: 9, title: 'Water Sports'},
                {id: 5, title: 'FooSportBaz'}
            ]);
        });

        it('filters out already selected topics from results', function () {
            var promise,
                onSuccessSpy = jasmine.createSpy();

            scope.selectedTopics= [{id: 9, title: 'Water Sports'}];

            promise = scope.findTopics('Sport');
            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith([
                {id: 2, title: 'Motor Sports'},
                {id: 5, title: 'FooSportBaz'}
            ]);
        });

        it('filters out already assigned topics from results', function () {
            var promise,
                onSuccessSpy = jasmine.createSpy();

            scope.assignedTopics= [{id: 9, title: 'Water Sports'}];

            promise = scope.findTopics('Sport');
            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith([
                {id: 2, title: 'Motor Sports'},
                {id: 5, title: 'FooSportBaz'}
            ]);
        });

        it('retrieves all topics list only once', function () {
            var promise,
                onSuccessSpy = jasmine.createSpy();

            scope.findTopics('Sport');
            deferredGetAll.resolve();
            scope.$digest();

            scope.findTopics('Economy');
            deferredGetAll.resolve();
            scope.$digest();

            expect(Topic.getAll.callCount).toEqual(1);
        });
    });

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

            articleService.articleInstance.articleId = 18;
            articleService.articleInstance.language = 'it';

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
