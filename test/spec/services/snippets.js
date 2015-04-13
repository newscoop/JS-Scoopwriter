'use strict';

/**
* Module with tests for the snippets service.
*
* @module snippets service tests
*/

describe('Service: snippets', function () {
    var Snippet,
        snippets,
        snippetsResponse,
        $window,
        Translator,
        mockTranslator,
        $rootScope;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(module(function ($provide) {
        // create a fake article service to inject around into other services
        var articleServiceMock = {
            articleInstance: {articleId: 55, language: 'pl'}
        };
        $provide.value('article', articleServiceMock);
    }));

    beforeEach(inject(function ($injector) {
        mockTranslator = {
            trans: function (value) {
                return value;
            }
        };

        $window = $injector.get('$window');
        $window.Translator = mockTranslator;
        Translator = $injector.get('Translator');
    }));

    beforeEach(inject(function (_$rootScope_, _Snippet_) {
        // NOTE: snippets is not injected here yet, because we first need
        // to tailor our fake article service here
        $rootScope = _$rootScope_;
        Snippet = _Snippet_;

        snippetsResponse = [{id: 5}, {id: 2}, {id: 12}];
        spyOn(Snippet, 'getAllByArticle').andReturn(snippetsResponse);
    }));

    // article service and Snippet service are mocket at this point,
    // snippets service can now be injected
    beforeEach(inject(function (_snippets_) {
        snippets = _snippets_;
    }));

    afterEach(function () {
        delete $window.Translator;
    });

    it('stores retrieved article data', function () {
        expect(snippets.article).toEqual({articleId: 55, language: 'pl'});
    });

    it('initializes the list of attached snippets', function () {
        expect(snippets.attached).toEqual([{id: 5}, {id: 2}, {id: 12}]);
    });

    it('initializes the list of snippets present in article body to empty',
        function () {
            expect(snippets.inArticleBody).toEqual({});
        }
    );

    describe('addToIncluded() method', function () {
        it('adds snippet ID to the list of snippets in article body',
            function () {
                snippets.inArticleBody = {19: true};
                snippets.addToIncluded(7);
                expect(snippets.inArticleBody).toEqual({7: true, 19: true});
            }
        );
    });

    describe('removeFromIncluded() method', function () {
        it('removes snippet ID from the list of snippets in article body',
            function () {
                snippets.inArticleBody = {19: true, 6: true, 8: true};
                snippets.removeFromIncluded(6);
                expect(snippets.inArticleBody).toEqual({8: true, 19: true});
            }
        );
    });

    describe('addToArticle() method', function () {
        var articleInfo,
            deferredAdd,
            snippetObj;

        beforeEach(inject(function ($q) {
            articleInfo = {articleId: 35, language: 'pl'};
            snippetObj = {
                id: 7,
                addToArticle: function () {}
            };
            deferredAdd = $q.defer();
            spyOn(snippetObj, 'addToArticle').andReturn(deferredAdd.promise);
        }));

        it('does not try to attach an already attached snippet', function () {
            snippets.attached = [{id: 5}, {id: 7}, {id: 2}];
            snippets.addToArticle(snippetObj, articleInfo);
            expect(snippetObj.addToArticle).not.toHaveBeenCalled();
        });

        it('invokes snippet\'s addToArticle method with correct parameters',
            function () {
                snippets.attached = [{id: 5}, {id: 2}];
                snippets.addToArticle(snippetObj, articleInfo);
                expect(snippetObj.addToArticle).toHaveBeenCalledWith(35, 'pl');
            }
        );

        it('updates the list of attached snippets on success', function () {
            snippets.attached = [{id: 5}, {id: 2}];

            snippets.addToArticle(snippetObj, articleInfo);
            deferredAdd.resolve();
            $rootScope.$apply();

            expect(snippets.attached).toEqual([{id: 5}, {id: 2}, snippetObj]);
        });
    });

    describe('removeFromArticle() method', function () {
        var articleInfo,
            deferredRemove,
            snippetObj;

        beforeEach(inject(function ($q) {
            articleInfo = {articleId: 35, language: 'pl'};
            snippetObj = {
                id: 7,
                removeFromArticle: function () {}
            };

            deferredRemove = $q.defer();
            spyOn(snippetObj, 'removeFromArticle')
                .andReturn(deferredRemove.promise);
        }));

        it('does not try to detach an already detached snippet', function () {
            snippets.attached = [{id: 5}, {id: 2}];
            snippets.removeFromArticle(snippetObj, articleInfo);
            expect(snippetObj.removeFromArticle).not.toHaveBeenCalled();
        });

        it('invokes snippet\'s removeFromArticle method with' +
           'correct parameters',
            function () {
                snippets.attached = [{id: 5}, {id: 7}, {id: 2}];
                snippets.removeFromArticle(snippetObj, articleInfo);
                expect(snippetObj.removeFromArticle)
                    .toHaveBeenCalledWith(35, 'pl');
            }
        );

        it('updates the list of attached snippets on success', function () {
            snippets.attached = [{id: 5}, snippetObj, {id: 2}];

            snippets.removeFromArticle(snippetObj, articleInfo);
            deferredRemove.resolve();
            $rootScope.$apply();

            expect(snippets.attached).toEqual([{id: 5}, {id: 2}]);
        });
    });

});
