'use strict';

describe('Controller: PaneSnippetsCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var article,
        articleDeferred,
        Snippet,
        SnippetTemplate,
        SnippetsCtrl,
        snippetsService,
        scope,
        $q;

    // Initialize the controller and a mock scope
    beforeEach(inject(
        function (
            $controller, $rootScope, _$q_, _article_, _Snippet_,
            _SnippetTemplate_, snippets
        ) {
            $q = _$q_;
            article = _article_;
            Snippet = _Snippet_;
            SnippetTemplate = _SnippetTemplate_;
            snippetsService = snippets;

            articleDeferred = $q.defer();
            article.promise = articleDeferred.promise;

            spyOn(Snippet, 'getAllByArticle').andCallFake(function () {
                return [{id:1}, {id:2}];
            });

            spyOn(SnippetTemplate, 'getAll').andCallFake(function () {
                return [
                    {id:10, name: 'YouTube'},
                    {id:20, name: 'Vimeo'},
                    {id:30, name: 'FB Like'}
                ];
            });

            snippetsService.attached = [{id:5}];

            scope = $rootScope.$new();
            SnippetsCtrl = $controller('PaneSnippetsCtrl', {
                $scope: scope,
                article: article,
                Snippet: Snippet,
                SnippetTemplate: SnippetTemplate,
                snippets: snippetsService
            });
        }
    ));

    it('initializes scope\'s showAddSnippet flag to false', function () {
        expect(scope.showAddSnippet).toBe(false);
    });

    it('initializes newSnippet object in scope', function () {
        expect(scope.newSnippet).toEqual({name: '', template: null});
    });

    it('initializes scope\'s addingNewSnippet flag to false', function () {
        expect(scope.addingNewSnippet).toBe(false);
    });

    it('initializes (template field type --> HTML input type) ' +
       'mapping in scope',
        function () {
            // NOTE: must use a "frozen" version, otherwise built-in comparison
            // fails (probably due to different data descriptors of object's
            // properties)
            var expected = Object.freeze({
                integer: 'number',
                text: 'text',
                url: 'url'
            });
            expect(scope.inputFieldTypes).toEqual(expected);
        }
    );

    it('initializes a list of snippet templates in scope', function () {
        expect(SnippetTemplate.getAll).toHaveBeenCalled();
        expect(scope.snippetTemplates).toEqual([
            {id:10, name: 'YouTube'},
            {id:20, name: 'Vimeo'},
            {id:30, name: 'FB Like'}
        ]);
    });

    it('initializes a list of article snippets in scope to currently ' +
       'attached snippets',
        function () {
            expect(scope.snippets).toEqual([{id:5}]);
        }
    );

    it('updates a list of article snippets in scope when a change occurs',
        function () {
            // NOTE: don't modify the existing snippet service's attached
            // array (e.g. by using .push()), but instead assign it a new
            // array instance, as this correctly resembles the way the snippets
            // service internally works.
            snippetsService.attached = [{id:5}, {id:1}];
            scope.$apply();
            expect(scope.snippets).toEqual([{id:5}, {id:1}]);
        }
    );

    describe('scope\'s clearNewSnippetForm() method', function () {
        it('clears all new snippet form fields (deep)', function () {
            scope.snippetTemplates = [
                {
                    id:10,
                    name: 'YouTube',
                    fields: [
                        {name: 'field_1', value: 'foobar'},
                        {name: 'field_2', value: 'barbaz'}
                    ]
                },
                {
                    id:30,
                    name: 'FB Like',
                    fields: [ {name: 'counter', value: 42} ]
                }
            ];

            scope.newSnippet = {
                name: 'YouTube',
                template: {id: 5, code: '<foo>'}
            };

            scope.clearNewSnippetForm();

            expect(scope.newSnippet).toEqual({name: '', template: null});
            expect(scope.snippetTemplates).toEqual([
                {
                    id:10, name: 'YouTube',
                        fields: [
                            {name: 'field_1'}, {name: 'field_2'}
                        ]
                },
                {
                    id:30, name: 'FB Like', fields: [{name: 'counter'}]
                }
            ]);
        });
    });

    describe('scope\'s addNewSnippetToArticle() method', function () {
        var createdSnippet,
            deferredAddToArticle,
            deferredCreate,
            snippetData;

        beforeEach(inject(function ($q) {
            snippetData = {
                name: 'my video',
                template: {
                    id: 8,
                    fields: [{
                        name: 'public_link',
                        value: 'http://foo.bar/video.avi',
                        type: 'url'
                    }]
                }
            };

            deferredCreate = $q.defer();
            spyOn(Snippet, 'create').andCallFake(function () {
                return deferredCreate.promise;
            });
            createdSnippet = {id: 42};

            deferredAddToArticle = $q.defer();
            spyOn(snippetsService, 'addToArticle')
                .andReturn(deferredAddToArticle.promise);

            spyOn(scope, 'clearNewSnippetForm');
        }));

        it('sets addingNewSnippet flag before doing anything', function () {
            scope.addingNewSnippet = false;
            scope.addNewSnippetToArticle(snippetData);
            expect(scope.addingNewSnippet).toBe(true);
        });

        it('closes the add snippet form on successful server response',
            function () {
                scope.showAddSnippet = true;

                scope.addNewSnippetToArticle(snippetData);

                deferredCreate.resolve(createdSnippet);
                articleDeferred.resolve({number: 25, language: 'de'});
                deferredAddToArticle.resolve();
                scope.$digest();

                expect(scope.showAddSnippet).toBe(false);
            }
        );

        it('clears the add snippet form on successful server response',
            function () {
                scope.addNewSnippetToArticle(snippetData);

                deferredCreate.resolve(createdSnippet);
                articleDeferred.resolve({number: 25, language: 'de'});
                deferredAddToArticle.resolve();
                scope.$digest();

                expect(scope.clearNewSnippetForm).toHaveBeenCalled();
            }
        );

        it('leaves the add snippet form open on error', function () {
            scope.showAddSnippet = true;

            scope.addNewSnippetToArticle(snippetData);

            deferredCreate.reject();
            scope.$digest();

            expect(scope.showAddSnippet).toBe(true);
        });

        it('does not clear the add snippet form fields on error', function () {
            scope.addNewSnippetToArticle(snippetData);

            deferredCreate.reject();
            scope.$digest();

            expect(scope.clearNewSnippetForm).not.toHaveBeenCalled();
        });

        it('clears addingNewSnippet flag on successful server response',
            function () {
                scope.addNewSnippetToArticle(snippetData);
                scope.addingNewSnippet = true;

                deferredCreate.resolve(createdSnippet);
                articleDeferred.resolve({number: 25, language: 'de'});
                deferredAddToArticle.resolve();
                scope.$digest();

                expect(scope.addingNewSnippet).toBe(false);
            }
        );

        it('clears addingNewSnippet flag on error server response',
            function () {
                scope.addNewSnippetToArticle(snippetData);
                scope.addingNewSnippet = true;

                deferredCreate.reject();
                scope.$digest();

                expect(scope.addingNewSnippet).toBe(false);
            }
        );

        it('calls snippet factory method with correct parameters',
            function () {
                scope.addNewSnippetToArticle(snippetData);
                expect(Snippet.create).toHaveBeenCalledWith(
                    'my video', 8, {'public_link': 'http://foo.bar/video.avi'}
                );
            }
        );

        it('attaches created snippet to article', function () {
            scope.addNewSnippetToArticle(snippetData);
            deferredCreate.resolve(createdSnippet);
            articleDeferred.resolve({number: 25, language: 'de'});
            scope.$digest();

            expect(snippetsService.addToArticle).toHaveBeenCalledWith(
                createdSnippet,
                {number: 25, language: 'de'}
            );
        });
    });


    describe('scope\'s confirmRemoveSnippet() method', function () {
        var snippet,
            modalDeferred,
            modalFactory;

        beforeEach(inject(function ($q, _modalFactory_) {
            modalDeferred = $q.defer();
            modalFactory = _modalFactory_;

            spyOn(modalFactory, 'confirmLight').andCallFake(function () {
                return {
                    result: modalDeferred.promise
                }
            });
            snippet = {id: 42};

            spyOn(snippetsService, 'removeFromArticle');
        }));

        it('opens a "light" confirmation dialog', function () {
            scope.confirmRemoveSnippet();
            expect(modalFactory.confirmLight).toHaveBeenCalled();
        });

        it('invokes snippets service\'s removeFromArticle() method ' +
           'with correct parameters on action confirmation',
           function () {
                articleDeferred.resolve({number: 25, language: 'de'});
                scope.$apply();

                scope.confirmRemoveSnippet(snippet);
                modalDeferred.resolve(true);
                scope.$apply();

                expect(snippetsService.removeFromArticle).toHaveBeenCalledWith(
                    snippet, {number: 25, language: 'de'});
            }
        );

        it('does not remove anything on action cancellation', function () {
            articleDeferred.resolve({number: 25, language: 'de'});
            scope.$apply();

            scope.confirmRemoveSnippet(snippet);
            modalDeferred.reject(true);
            scope.$apply();

            expect(snippetsService.removeFromArticle).not.toHaveBeenCalled();
        });
    });

    describe('scope\'s inArticleBody() method', function () {
        beforeEach(function () {
            snippetsService.inArticleBody = {2: true, 4: true, 11: true};
        });

        it('returns true for image present in article body', function () {
            expect(scope.inArticleBody(4)).toBe(true);
        });

        it('returns false for image NOT present in article body', function () {
            expect(scope.inArticleBody(1)).toBe(false);
        });
    });
});
