'use strict';

describe('Controller: PaneSnippetsCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var article,
        articleDeferred,
        Snippet,
        SnippetsCtrl,
        scope,
        $q;

    // Initialize the controller and a mock scope
    beforeEach(inject(
        function ($controller, $rootScope, _$q_, _article_, _Snippet_) {
            $q = _$q_;
            article = _article_;
            Snippet = _Snippet_;

            articleDeferred = $q.defer();
            article.promise = articleDeferred.promise;

            spyOn(Snippet, 'getAllByArticle').andCallFake(function () {
                return [{id:1}, {id:2}, {id:3}];
            });

            scope = $rootScope.$new();
            SnippetsCtrl = $controller('PaneSnippetsCtrl', {
                $scope: scope,
                article: article,
                Snippet: Snippet
            });
    }));

    it('initializes showAddSnippet flag to false', function () {
        expect(scope.showAddSnippet).toBe(false);
    });

    it('initializes a list of article snippets in scope', function () {
        articleDeferred.resolve({number: 55, language: 'pl'});
        scope.$apply();
        expect(Snippet.getAllByArticle).toHaveBeenCalledWith(55, 'pl');
        expect(scope.snippets).toEqual([{id:1}, {id:2}, {id:3}]);
    });
});
