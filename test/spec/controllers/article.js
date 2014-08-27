'use strict';

/**
* Module with tests for the ArticleCtrl controller.
*
* @module ArticleCtrl tests
*/

describe('Controller: ArticleCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var ArticleCtrl,
        articleService,
        ArticleType,
        getArticleDeferred,
        getArticleTypeDeferred,
        modeService,
        panesService,
        platformService,
        scope;

    beforeEach(inject(function ($controller, $rootScope, $q, article) {
        articleService = article;

        scope = $rootScope.$new();
        modeService = {};
        platformService = {};
        panesService = {
            query: jasmine.createSpy('panes.query()').andReturn(
                [{id: 1, name: 'pane_1'}, {id: 2, name: 'pane_2'}]
            )
        };

        getArticleDeferred = $q.defer();
        spyOn(articleService, 'init');
        articleService.promise = getArticleDeferred.promise;

        ArticleType = {
            getByName: jasmine.createSpy('ArticleType.getByName()')
        };
        getArticleTypeDeferred = $q.defer();
        ArticleType.getByName.andReturn(getArticleTypeDeferred.promise);

        ArticleCtrl = $controller('ArticleCtrl', {
            $scope: scope,
            $routeParams: {article: 123, language: 'en'},
            article: articleService,
            ArticleType: ArticleType,
            mode: modeService,
            panes: panesService,
            platform: platformService
        });
    }));

    it('invokes article service initialization with correct parameters',
        function () {
            expect(articleService.init).toHaveBeenCalledWith(
                {articleId: 123, language: 'en'});
        }
    );

    it('exposes mode service in scope', function () {
        expect(scope.mode).toBe(modeService);
    });

    it('exposes article service in scope', function () {
        expect(scope.articleService).toBe(articleService);
    });

    describe('panes initialization', function () {
        it('retrieves panes list from panes service', function () {
            expect(panesService.query).toHaveBeenCalled();
        });
        it('initializes panes list in scope', function () {
            expect(scope.panes).toEqual(
                [{id: 1, name: 'pane_1'}, {id: 2, name: 'pane_2'}]
            );
        });
    });

    it('exposes platform service in scope', function () {
        expect(scope.platform).toBe(platformService);
    });

    it('exposes retrieved article in scope', function () {
        var retrievedArticle = {id: 123, type: 'news'};
        scope.article = undefined;

        getArticleDeferred.resolve(retrievedArticle);
        scope.$digest();

        expect(scope.article).toEqual(retrievedArticle);
    });

    it('retrieves info on retrieved article\'s type', function () {
        getArticleDeferred.resolve({id: 123, type: 'blog'});
        scope.$digest();
        expect(ArticleType.getByName).toHaveBeenCalledWith('blog');
    });

    describe('when article\'s type info is retrieved', function () {
        var article,
            articleTypeNews;

        beforeEach(inject(function (configuration) {
            configuration.articleTypeFields = {
                news: {
                    title: {name: 'title', order: 10},
                    body: {name: 'body', order: 20, defaultText: '[body]'}
                }
            };

            article = {
                id: 123,
                language: 'en',
                type: 'news',
                title: 'Article title',
                fields: {
                    body: '<p>Paragraph 1</p>\n<p>Paragraph 2</p>',
                    printsection: 'Sports'
                }
            };

            articleTypeNews = {
                name: 'news',
                fields: [
                    {name: 'body'},
                    {name: '_internal'}
                ]
            };

            spyOn(articleService, 'deserializeAlohaBlocks');
        }));

        it('exposes all article fields from config in scope', function () {
            var match;

            getArticleDeferred.resolve(article);
            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            match = _(scope.editableFields).find({name: 'title'});
            expect(match).toBeDefined();
            match = _(scope.editableFields).find({name: 'body'});
            expect(match).toBeDefined();
        });

        it('does not expose article type\'s fields not found in config',
            function () {
                var match;

                getArticleDeferred.resolve(article);
                getArticleTypeDeferred.resolve(articleTypeNews);
                scope.$digest();

                match = _(scope.editableFields).find({name: '_internal'});
                expect(match).toBeUndefined();
            }
        );

        it('deserializes Aloha blocks in article fields', function () {
            articleService.deserializeAlohaBlocks.andReturn('<deserialized>');

            getArticleDeferred.resolve(article);
            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            expect(scope.article.fields.body).toEqual('<deserialized>');
        });

        it('sets empty article fields to their default text', function () {
            article.fields.body = null;

            getArticleDeferred.resolve(article);
            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            expect(scope.article.fields.body).toEqual('[body]');
        });
    });

});
