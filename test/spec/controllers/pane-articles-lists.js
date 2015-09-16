'use strict';

/**
* Module with tests for the articlesLists pane controller.
*
* @module PaneArticlesListsCtrl controller tests
*/
describe('Controller: PaneArticlesListsCtrl', function () {
    var articleService,
        PaneArticlesListsCtrl,
        scope,
        ArticlesList;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, $rootScope, _article_, _ArticlesList_
    ) {
        articleService = _article_;
        ArticlesList = _ArticlesList_;

        articleService.articleInstance = {
            articleId: 17,
            language: 'it'
        };

        spyOn(ArticlesList, 'getAllByArticle').andReturn(
            [{id: 1, title: 'foo'}, {id: 4, title: 'bar'}]
        );

        scope = $rootScope.$new();

        scope.addArticlesList = {
            articlesListTitle: {
                $setValidity: jasmine.createSpy()
            }
        };

        PaneArticlesListsCtrl = $controller('PaneArticlesListsCtrl', {
            $scope: scope,
            article: articleService,
            ArticlesList: ArticlesList
        });
    }));

    it('initializes the list of selected articlesLists in scope to empty list',
        function () {
            expect(scope.selectedArticlesLists).toEqual([]);
        }
    );

    it('initializes the assigningArticlesLists flag in scope to false', function () {
        expect(scope.assigningArticlesLists).toBe(false);
    });

    it('initializes the assigningArticlesLists flag in scope to false', function () {
        expect(scope.assigningArticlesLists).toBe(false);
    });

    it('initializes options for the parent articlesList widget', function () {
        expect(scope.select2Options).toEqual({
            minimumInputLength: 3,
            query: ArticlesList.liveSearchQuery
        });
    });

    it('initializes the new articlesList form\'s data to empty values', function () {
        expect(scope.newArticlesList).toEqual({title: ''});
    });


    describe('initialization of article articlesLists in scope', function () {
        it('invokes service\'s getAllByArticle() method with correct ' +
           'parameters',
            function () {
                expect(ArticlesList.getAllByArticle).toHaveBeenCalledWith(17, 'it');
            }
        );

        it('exposes retrieved articlesLists in scope', function () {
            expect(scope.assignedArticlesLists).toEqual(
                [{id: 1, title: 'foo'}, {id: 4, title: 'bar'}]
            );
        });
    });


    describe('scope\'s clearSelectedArticlesLists() method', function () {
        it('clears the selected articlesLists list', function () {
            scope.selectedArticlesLists = [
                {id: 1, title: 'articlesList 1'}, {id: 5, title: 'articlesList 5'}
            ];
            scope.clearSelectedArticlesLists();
            expect(scope.selectedArticlesLists).toEqual([]);
        });
    });


    describe('scope\'s findArticlesLists() method', function () {
        var deferredGetAll,
            allArticlesLists;

        beforeEach(inject(function ($q) {
            allArticlesLists = [
                {id: 2, title: 'Motor Sports'},
                {id: 9, title: 'Water Sports'},
                {id: 3, title: 'Politics'},
                {id: 5, title: 'FooSportBaz'},
                {id: 1, title: 'Local News'},
                {id: 8, title: 'Economy'}
            ];

            deferredGetAll = $q.defer();
            allArticlesLists.$promise = deferredGetAll.promise;
            spyOn(ArticlesList, 'getAll').andReturn(allArticlesLists);

            scope.selectedArticlesLists = [];
            scope.assignedArticlesLists = [];
        }));

        it('returns a promise', inject(function ($q) {
            var promiseConstructor = $q.defer().promise.constructor,
                promise = scope.findArticlesLists('foo');
            expect(promise instanceof promiseConstructor).toBe(true);
        }));

        it('resolves given promise with found articlesLists list', function () {
            var promise = scope.findArticlesLists('litic'),
                onSuccessSpy = jasmine.createSpy();

            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith(
                [{id: 3, title: 'Politics'}]
            );
        });

        it('performs a case-insensitive search', function () {
            var promise = scope.findArticlesLists('SpoRt'),
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

        it('filters out already selected articlesLists from results', function () {
            var promise,
                onSuccessSpy = jasmine.createSpy();

            scope.selectedArticlesLists= [{id: 9, title: 'Water Sports'}];

            promise = scope.findArticlesLists('Sport');
            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith([
                {id: 2, title: 'Motor Sports'},
                {id: 5, title: 'FooSportBaz'}
            ]);
        });

        it('filters out already assigned articlesLists from results', function () {
            var promise,
                onSuccessSpy = jasmine.createSpy();

            scope.assignedArticlesLists= [{id: 9, title: 'Water Sports'}];

            promise = scope.findArticlesLists('Sport');
            promise.then(onSuccessSpy);
            deferredGetAll.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith([
                {id: 2, title: 'Motor Sports'},
                {id: 5, title: 'FooSportBaz'}
            ]);
        });

        it('retrieves all articlesLists list only once', function () {
            scope.findArticlesLists('Sport');
            deferredGetAll.resolve();
            scope.$digest();

            scope.findArticlesLists('Economy');
            deferredGetAll.resolve();
            scope.$digest();

            expect(ArticlesList.getAll.callCount).toEqual(1);
        });
    });

    describe('scope\'s assignSelectedToArticle() method', function () {
        var deferredAdd,
            deferred,
            toaster,
            articlesLists;

        beforeEach(inject(function ($q, _toaster_) {
            toaster = _toaster_;
            deferred = $q.defer();
            articlesLists = [
                {id: 2, title: 'articlesList 2'},
                {id: 9, title: 'articlesList 9'},
            ];

            deferredAdd = $q.defer();
            spyOn(ArticlesList, 'addToArticle').andReturn(deferredAdd.promise);

            articleService.articleInstance.articleId = 18;
            articleService.articleInstance.language = 'it';

            scope.selectedArticlesLists = angular.copy(articlesLists);
            scope.assignedArticlesLists = [{id: 4, title: 'articlesList 4'}];

            spyOn(toaster, 'add').andCallFake(function () {
                return deferred.promise;
            });
        }));

        it('sets the assigningArticlesLists flag before doing anything', function () {
            scope.assigningArticlesLists = false;
            scope.assignSelectedToArticle();
            expect(scope.assigningArticlesLists).toBe(true);
        });

        it('invokes the ArticlesList service\'s addToArticle() method with correct ' +
           'parameters',
            function () {
                scope.assignSelectedToArticle();
                expect(ArticlesList.addToArticle).toHaveBeenCalledWith(
                    18, 'it', articlesLists
                );
            }
        );

        it('clears the assigningArticlesLists flag on successful server response',
            function () {
                scope.assignSelectedToArticle();
                scope.assigningArticlesLists = true;  // make sure the flag is set

                deferredAdd.resolve(articlesLists);
                scope.$apply();

                expect(scope.assigningArticlesLists).toBe(false);
            }
        );

        it('calls toaster.add() with appropriate params on success', function () {
            scope.assignSelectedToArticle();
            deferredAdd.resolve(articlesLists);
            scope.$apply();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.articleslists.assign.success'
            });
        });

        it('calls toaster.add() with appropriate params on error', function () {
            scope.assignSelectedToArticle();
            deferredAdd.reject(false);
            scope.$apply();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.articleslists.assign.error'
            });
        });

        it('clears the assigningArticlesLists flag on server error response',
            function () {
                scope.assignSelectedToArticle();
                scope.assigningArticlesLists = true;  // make sure the flag is set

                deferredAdd.reject('Timeout');
                scope.$apply();

                expect(scope.assigningArticlesLists).toBe(false);
            }
        );

        it('adds added articlesLists to the assignedArticlesLists list on successful ' +
           'server response',
            function () {
                scope.assignSelectedToArticle();

                deferredAdd.resolve(articlesLists);
                scope.$apply();

                expect(scope.assignedArticlesLists).toEqual([
                    {id: 4, title: 'articlesList 4'},
                    {id: 2, title: 'articlesList 2'},
                    {id: 9, title: 'articlesList 9'}
                ]);
            }
        );

        it('clears the selected articlesLists list on successful server response',
            function () {
                scope.assignSelectedToArticle();

                deferredAdd.resolve(articlesLists);
                scope.$apply();

                expect(scope.selectedArticlesLists).toEqual([]);
            }
        );
    });

    describe('scope\'s confirmUnassignArticlesList() method', function () {
        var deferedRemove,
            articlesList,
            deferred,
            toaster,
            modalDeferred,
            modalFactory;

        beforeEach(inject(function ($q, _modalFactory_, _toaster_) {
            toaster = _toaster_;
            deferred = $q.defer();
            deferedRemove = $q.defer();
            modalDeferred = $q.defer();
            modalFactory = _modalFactory_;

            articleService.articleInstance.articleId = 25;
            articleService.articleInstance.language = 'de';

            spyOn(modalFactory, 'confirmLight').andCallFake(function () {
                return {
                    result: modalDeferred.promise
                };
            });

            ArticlesList.getAllByArticle.andReturn([]);

            articlesList = {
                id: 20,
                removeFromArticle: function () {}
            };
            spyOn(articlesList, 'removeFromArticle').andReturn(deferedRemove.promise);

            spyOn(toaster, 'add').andCallFake(function () {
                return deferred.promise;
            });
        }));

        it('opens a "light" confirmation dialog', function () {
            scope.confirmUnassignArticlesList(articlesList);
            expect(modalFactory.confirmLight).toHaveBeenCalled();
        });

        it('invokes articlesList\'s removeFromArticle() method ' +
            'with correct parameters on action confirmation',
            function () {
                scope.confirmUnassignArticlesList(articlesList);
                modalDeferred.resolve();
                scope.$apply();

                expect(articlesList.removeFromArticle).toHaveBeenCalledWith(25, 'de', articlesList);
            }
        );

        it('does not try to unassign articlesList on action cancellation',
            function () {
                scope.confirmUnassignArticlesList(articlesList);
                modalDeferred.reject();
                scope.$apply();

                expect(articlesList.removeFromArticle).not.toHaveBeenCalled();
            }
        );

        it('removes the articlesList from the list of assigned articlesLists ' +
           'on action confirmation',
           function () {
                scope.assignedArticlesLists= [
                    {id: 4, title: 'articlesList 4'},
                    {id: 20, title: 'articlesList 20'},
                    {id: 8, title: 'articlesList 8'}
                ];

                scope.confirmUnassignArticlesList(articlesList);
                modalDeferred.resolve();
                deferedRemove.resolve();
                scope.$apply();

                expect(scope.assignedArticlesLists).toEqual(
                    [{id: 4, title: 'articlesList 4'}, {id: 8, title: 'articlesList 8'}]
                );
            }
        );

        it('calls toaster.add() with appropriate params on success', function () {
            scope.confirmUnassignArticlesList(articlesList);
            modalDeferred.resolve();
            deferedRemove.resolve();
            scope.$apply();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.articleslists.unassign.success'
            });
        });

        it('calls toaster.add() with appropriate params on error', function () {
            scope.confirmUnassignArticlesList(articlesList);
            modalDeferred.resolve();
            deferedRemove.reject(false);
            scope.$apply();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.articleslists.unassign.error'
            });
        });
    });

});
