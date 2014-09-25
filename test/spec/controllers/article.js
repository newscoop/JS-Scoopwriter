'use strict';

/**
* Module with tests for the ArticleCtrl controller.
*
* @module ArticleCtrl tests
*/

describe('Controller: ArticleCtrl', function () {
    var ArticleCtrl,
        articleService,
        ArticleType,
        fakeTextStats,
        getArticleDeferred,
        getArticleTypeDeferred,
        modeService,
        panesService,
        platformService,
        saveArticleDeferred,
        scope;

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

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

        saveArticleDeferred = $q.defer();
        spyOn(articleService, 'save').andReturn(saveArticleDeferred.promise);

        fakeTextStats = {chars: 0, words: 0};
        spyOn(articleService, 'textStats').andCallFake(function () {
            return fakeTextStats;
        });

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

    describe('fieldStatsText() helper method', function () {
        beforeEach(function () {
            scope.article = {
                title: 'Article Title',
                fields: {
                    body: 'Body text.'
                }
            };
        });

        it('invokes textStats() service method with correct parameters ' +
           'for a regular article field',
            function () {
                ArticleCtrl.fieldStatsText('body');
                expect(articleService.textStats)
                    .toHaveBeenCalledWith('Body text.');
            }
        );

        it('invokes textStats() service method with correct parameters ' +
           'for the article title',
            function () {
                ArticleCtrl.fieldStatsText('title');
                expect(articleService.textStats)
                    .toHaveBeenCalledWith('Article Title');
            }
        );

        it('returns stats text for the given article field', function () {
            var result;

            fakeTextStats = {chars: 10, words: 2};
            result = ArticleCtrl.fieldStatsText('body');
            expect(result).toEqual('10 Characters / 2 Words');
        });

        it('uses singular form in returned text when necessary', function () {
            var result;

            fakeTextStats = {chars: 1, words: 1};
            result = ArticleCtrl.fieldStatsText('body');
            expect(result).toEqual('1 Character / 1 Word');
        });
    });

    describe('on editor content change', function () {
        var alohaEditable;

        beforeEach(function () {
            alohaEditable = {
                triggerType: 'keypress',
                editable: {
                    originalObj: {
                        data: function () {
                            return 'teaser';  // return changed field's name
                        }
                    }
                }
            };
            spyOn(ArticleCtrl, 'fieldStatsText');
            scope.editableFields = [
                {name: 'teaser', statsText: ''},
                {name: 'body', statsText: ''}
            ];
        });

        it('updates changed field\'s stats text ', function () {
            ArticleCtrl.fieldStatsText.andReturn('26 Characters / 5 Words');
            scope.$emit('texteditor-content-changed', {}, alohaEditable);

            expect(
                scope.editableFields[0].statsText  // teaser field
            ).toEqual('26 Characters / 5 Words');
        });

        it('does not do anything if event\'s trigger type is "blur"',
            function () {
                scope.editableFields[0].statsText = 'Original stats text';
                ArticleCtrl.fieldStatsText.andReturn('New stats text');
                alohaEditable.triggerType = 'blur';

                scope.$emit('texteditor-content-changed', {}, alohaEditable);

                expect(
                    scope.editableFields[0].statsText
                ).toEqual('Original stats text');  // remains unchanged
            }
        );
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

        it('sets fields\' stats text', function () {
            var field;

            scope.editableFields = [
                {name: 'title', statsText: undefined},
                {name: 'body', statsText: undefined}
            ];
            spyOn(ArticleCtrl, 'fieldStatsText').andReturn('foo / bar');

            getArticleDeferred.resolve(article);
            getArticleTypeDeferred.resolve(articleTypeNews);

            scope.$digest();

            field = _(scope.editableFields).find({name: 'title'});
            expect(field.statsText).toEqual('foo / bar');
            field = _(scope.editableFields).find({name: 'body'});
            expect(field.statsText).toEqual('foo / bar');
        });
    });

    describe('scope\'s save() method', function () {
        it('invokes article service with the article object as a parameter',
            function () {
                scope.article = {id: 1234};
                scope.save();
                expect(articleService.save).toHaveBeenCalledWith({id: 1234});
            }
        );

        it('clears the article modifed flag in article service', function () {
            articleService.modified = true;

            scope.save();
            saveArticleDeferred.resolve();
            scope.$digest();

            expect(articleService.modified).toBe(false);
        });
    });

});
