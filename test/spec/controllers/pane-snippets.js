'use strict';

describe('Controller: PaneSnippetsCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var article,
        articleDeferred,
        Snippet,
        SnippetTemplate,
        SnippetsCtrl,
        scope,
        $q;

    // Initialize the controller and a mock scope
    beforeEach(inject(
        function (
            $controller, $rootScope, _$q_, _article_, _Snippet_,
            _SnippetTemplate_
        ) {
            $q = _$q_;
            article = _article_;
            Snippet = _Snippet_;
            SnippetTemplate = _SnippetTemplate_;

            articleDeferred = $q.defer();
            article.promise = articleDeferred.promise;

            spyOn(Snippet, 'getAllByArticle').andCallFake(function () {
                return [{id:1}, {id:2}, {id:3}];
            });

            spyOn(SnippetTemplate, 'getAll').andCallFake(function () {
                return [
                    {id:10, name: 'YouTube'},
                    {id:20, name: 'Vimeo'},
                    {id:30, name: 'FB Like'}
                ];
            });

            scope = $rootScope.$new();
            SnippetsCtrl = $controller('PaneSnippetsCtrl', {
                $scope: scope,
                article: article,
                Snippet: Snippet,
                SnippetTemplate: SnippetTemplate
            });
        }
    ));

    it('initializes showAddSnippet flag to false', function () {
        expect(scope.showAddSnippet).toBe(false);
    });

    it('initializes a list of snippet templates in scope', function () {
        expect(SnippetTemplate.getAll).toHaveBeenCalled();
        expect(scope.snippetTemplates).toEqual([
            {id:10, name: 'YouTube'},
            {id:20, name: 'Vimeo'},
            {id:30, name: 'FB Like'}
        ]);
    });

    it('initializes a list of article snippets in scope', function () {
        articleDeferred.resolve({number: 55, language: 'pl'});
        scope.$apply();
        expect(Snippet.getAllByArticle).toHaveBeenCalledWith(55, 'pl');
        expect(scope.snippets).toEqual([{id:1}, {id:2}, {id:3}]);
    });
});
