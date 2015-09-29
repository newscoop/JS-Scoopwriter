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
        ArticlesList,
        lists,
        deferredGetAll,
        $modal,
        $templateCache,
        $httpBackend;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, $rootScope, $templateCache, _article_, _ArticlesList_,
        _$modal_, _$httpBackend_, $q
    ) {
        var modalTemplate;

        articleService = _article_;
        ArticlesList = _ArticlesList_;

        articleService.articleInstance = {
            articleId: 123,
            language: 'en',
            languageData: {
                id: 1,
                name: 'English'
            }
        };

        deferredGetAll = $q.defer();
        lists = [{id: 1, title: 'foo'}, {id: 4, title: 'bar'}];
        lists.$promise = deferredGetAll.promise;

        spyOn(ArticlesList, 'getAllByArticle').andReturn(lists);

        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        $modal = _$modal_;

        spyOn(scope, '$broadcast').andCallThrough();
        spyOn($modal, 'open').andCallThrough();

        modalTemplate = $templateCache.get(
            'app/views/modal-articles-lists-editor.html');
        $httpBackend.whenGET('views/modal-articles-lists-editor.html')
            .respond(200, modalTemplate);

        scope.addArticlesList = {
            articlesListTitle: {
                $setValidity: jasmine.createSpy()
            }
        };

        PaneArticlesListsCtrl = $controller('PaneArticlesListsCtrl', {
            $modal: $modal,
            $scope: scope,
            article: articleService,
            ArticlesList: ArticlesList,
        });
    }));

    describe('openArticlesListsEditor() method', function () {
        it('opens a modal to edit selected featured articles list', function () {
            var callArgs,
                expectedInfo;

            PaneArticlesListsCtrl.openArticlesListsEditor('edit', 1);

            expect($modal.open).toHaveBeenCalled();
            callArgs = $modal.open.mostRecentCall.args[0];

            expect(callArgs.templateUrl).toEqual(
                'views/modal-articles-lists-editor.html');
            expect(callArgs.controllerAs).toEqual('modalArticlesListsEditorCtrl');

            expectedInfo = {
                articleId: 123,
                language: 1,
                action: 'edit',
                articlesListId: 1
            };
            expect(callArgs.resolve.info())
                .toEqual(expectedInfo);
        });

        it('opens a modal to attach an article to the featured articles list',
            function () {
                var callArgs,
                    expectedInfo;

                PaneArticlesListsCtrl.openArticlesListsEditor('attach');

                expect($modal.open).toHaveBeenCalled();
                callArgs = $modal.open.mostRecentCall.args[0];

                expect(callArgs.templateUrl).toEqual(
                    'views/modal-articles-lists-editor.html');
                expect(callArgs.controllerAs).toEqual('modalArticlesListsEditorCtrl');

                expectedInfo = {
                    articleId: 123,
                    language: 1,
                    action: 'attach'
                };

                expect(callArgs.resolve.info())
                    .toEqual(expectedInfo);
            }
        );
    });

    describe('initialization of article articlesLists in scope', function () {
        it('invokes service\'s getAllByArticle() method with correct ' +
           'parameters',
            function () {
                expect(ArticlesList.getAllByArticle).toHaveBeenCalledWith(123, 'en');
            }
        );

        it('exposes retrieved articlesLists in scope', function () {
            expect(PaneArticlesListsCtrl.assignedArticlesLists).toEqual(
                lists
            );
        });

        it('$scope.$on should have been triggered', function() {
            scope.$broadcast("close-articles-lists-modal");
            expect(scope.$broadcast).toHaveBeenCalledWith("close-articles-lists-modal");
        });

        describe('resolves given promise with fetched lists', function () {
            it('adds a new list to an array of existing lists', function () {
                var existingLists = [
                    {id: 1, title: 'foo'},
                    {id: 4, title: 'bar'}
                ];

                var newlyAddedLists = [
                    {id: 2, title: 'baz'}
                ];

                var expectedData = existingLists.concat(newlyAddedLists);
                PaneArticlesListsCtrl.assignedArticlesLists = existingLists;
                scope.$broadcast("close-articles-lists-modal");
                deferredGetAll.resolve(expectedData);
                scope.$digest();

                expect(scope.$broadcast).toHaveBeenCalledWith("close-articles-lists-modal");
                expect(PaneArticlesListsCtrl.assignedArticlesLists).toEqual(
                    expectedData
                );
            });

            it('removes the list from the existing list', function () {
                var existingLists = [
                    {id: 1, title: 'foo'},
                    {id: 4, title: 'bar'}
                ];

                var expectedData = [{id: 4, title: 'bar'}];
                PaneArticlesListsCtrl.assignedArticlesLists = existingLists;
                scope.$broadcast("close-articles-lists-modal");
                deferredGetAll.resolve(expectedData);
                scope.$digest();

                expect(scope.$broadcast).toHaveBeenCalledWith("close-articles-lists-modal");
                expect(PaneArticlesListsCtrl.assignedArticlesLists).toEqual(
                    expectedData
                );
            });

            it('removes the two consecutive lists from the existing lists', function () {
                var existingLists = [
                    {id: 1, title: 'foo'},
                    {id: 2, title: 'bar'},
                    {id: 3, title: 'baz'}
                ];

                var expectedData = [{id: 3, title: 'baz'}];
                PaneArticlesListsCtrl.assignedArticlesLists = existingLists;
                scope.$broadcast("close-articles-lists-modal");
                deferredGetAll.resolve(expectedData);
                scope.$digest();

                expect(scope.$broadcast).toHaveBeenCalledWith("close-articles-lists-modal");
                expect(PaneArticlesListsCtrl.assignedArticlesLists).toEqual(
                    expectedData
                );
            });

            it('removes the two random lists from the existing lists', function () {
                var existingLists = [
                    {id: 1, title: 'foo'},
                    {id: 2, title: 'bar'},
                    {id: 3, title: 'baz'}
                ];

                var expectedData = [{id: 2, title: 'bar'}];
                PaneArticlesListsCtrl.assignedArticlesLists = existingLists;
                scope.$broadcast("close-articles-lists-modal");
                deferredGetAll.resolve(expectedData);
                scope.$digest();

                expect(scope.$broadcast).toHaveBeenCalledWith("close-articles-lists-modal");
                expect(PaneArticlesListsCtrl.assignedArticlesLists).toEqual(
                    expectedData
                );
            });

            it('removes the two consecutive lists from the existing lists and adds' +
                ' a new one', function () {
                var existingLists = [
                    {id: 1, title: 'foo'},
                    {id: 4, title: 'bar'},
                    {id: 7, title: 'baz'}
                ];

                var expectedData = [{id: 4, title: 'bar'}, {id: 5, title: 'qux'}];
                PaneArticlesListsCtrl.assignedArticlesLists = existingLists;
                scope.$broadcast("close-articles-lists-modal");
                deferredGetAll.resolve(expectedData);
                scope.$digest();

                expect(scope.$broadcast).toHaveBeenCalledWith("close-articles-lists-modal");
                expect(PaneArticlesListsCtrl.assignedArticlesLists).toEqual(
                    expectedData
                );
            });
        });
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
            PaneArticlesListsCtrl.confirmUnassignArticlesList(articlesList);
            expect(modalFactory.confirmLight).toHaveBeenCalled();
        });

        it('invokes articlesList\'s removeFromArticle() method ' +
            'with correct parameters on action confirmation',
            function () {
                PaneArticlesListsCtrl.confirmUnassignArticlesList(articlesList);
                modalDeferred.resolve();
                scope.$apply();

                expect(articlesList.removeFromArticle).toHaveBeenCalledWith(25, 'de', articlesList);
            }
        );

        it('does not try to unassign articlesList on action cancellation',
            function () {
                PaneArticlesListsCtrl.confirmUnassignArticlesList(articlesList);
                modalDeferred.reject();
                scope.$apply();

                expect(articlesList.removeFromArticle).not.toHaveBeenCalled();
            }
        );

        it('removes the articlesList from the list of assigned articlesLists ' +
           'on action confirmation',
           function () {
                PaneArticlesListsCtrl.assignedArticlesLists= [
                    {id: 4, title: 'articlesList 4'},
                    {id: 20, title: 'articlesList 20'},
                    {id: 8, title: 'articlesList 8'}
                ];

                PaneArticlesListsCtrl.confirmUnassignArticlesList(articlesList);
                modalDeferred.resolve();
                deferedRemove.resolve();
                scope.$apply();

                expect(PaneArticlesListsCtrl.assignedArticlesLists).toEqual(
                    [{id: 4, title: 'articlesList 4'}, {id: 8, title: 'articlesList 8'}]
                );
            }
        );

        it('calls toaster.add() with appropriate params on success', function () {
            PaneArticlesListsCtrl.confirmUnassignArticlesList(articlesList);
            modalDeferred.resolve();
            deferedRemove.resolve();
            scope.$apply();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.articleslists.unassign.success'
            });
        });

        it('calls toaster.add() with appropriate params on error', function () {
            PaneArticlesListsCtrl.confirmUnassignArticlesList(articlesList);
            modalDeferred.resolve();
            deferedRemove.reject(false);
            scope.$apply();

            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.articleslists.unassign.error'
            });
        });
    });

    describe('modal\'s controller', function () {
        var ctrl,
            fakeModalInstance,
            infoParam,
            fakeSCE,
            ModalCtrl;

        beforeEach(function () {
            PaneArticlesListsCtrl.openArticlesListsEditor();

            // XXX: this is not ideal, since obtaining a reference to the
            // modal controller depends on the openPreview() method to provide
            // a correct controller parameterto the $modal.open() ... but on
            // the other hand, is there a good alternative on how to obtain
            // that reference?
            ModalCtrl = $modal.open.mostRecentCall.args[0].controller;

            fakeModalInstance = {
                close: jasmine.createSpy()
            };

            fakeSCE = {
                trustAsResourceUrl: function (url) {
                    return url;
                }
            };

            infoParam = {
                articleId: 123,
            };

            ctrl = new ModalCtrl(fakeModalInstance, fakeSCE, infoParam, scope);
        });

        it('exposes correct featured articles list edit URL', function () {
            var expectedUrl = [
                'http://server.net',
                '/admin/playlists',
                '/123',
                '/1',
                '/editor-view',
                '/1'
            ].join('');

            infoParam.action = 'edit';
            infoParam.language = 1;
            infoParam.articlesListId = 1;

            ctrl = new ModalCtrl(fakeModalInstance, fakeSCE, infoParam, scope);

            expect(ctrl.url).toEqual(expectedUrl);
        });

        it('exposes correct featured articles list attach URL', function () {
            var expectedUrl = [
                'http://server.net',
                '/admin/playlists',
                '/123',
                '/1',
                '/editor-view'
            ].join('');

            infoParam.action = 'attach';
            infoParam.language = 1;

            ctrl = new ModalCtrl(fakeModalInstance, fakeSCE, infoParam, scope);

            expect(ctrl.url).toEqual(expectedUrl);
        });

        it('exposes empty URL when not existing action provided', function () {
           var expectedUrl = [
                'http://server.net',
                '/admin/playlists',
                '/123',
                '/1',
                '/editor-view'
            ].join('');

            infoParam.action = 'other';
            infoParam.language = 1;

            ctrl = new ModalCtrl(fakeModalInstance, fakeSCE, infoParam, scope);

            expect(ctrl.url).not.toEqual(expectedUrl);
            expect(ctrl.url).toEqual("");
        });

        describe('close() method', function () {
            it("should broadcast 'close-articles-lists-modal' and close the modal", function() {
                ctrl.close();
                expect(scope.$broadcast).toHaveBeenCalledWith('close-articles-lists-modal');
                expect(fakeModalInstance.close).toHaveBeenCalled();
            });
        });
    });

});
