'use strict';

/**
* Module with tests for the ArticleCtrl controller.
*
* @module ArticleCtrl tests
*/

describe('Controller: ArticleCtrl', function () {
    var Article,
        ArticleCtrl,
        articleService,
        ArticleType,
        fakeTextStats,
        getArticleTypeDeferred,
        modeService,
        panesService,
        platformService,
        saveArticleDeferred,
        scope,
        $rootScope;

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($controller, _$rootScope_, $q, _Article_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();

        modeService = {};
        platformService = {};
        panesService = {
            query: jasmine.createSpy('panes.query()').andReturn(
                [{id: 1, name: 'pane_1'}, {id: 2, name: 'pane_2'}]
            )
        };

        articleService = {};
        articleService.articleInstance = {
            articleId: 123,
            language: 'en',
            type: 'news',
            fields: {
                dateline: '1st Aug 2010',
                body: 'Body text.'
            },
            setWorkflowStatus: jasmine.createSpy(),
            save: jasmine.createSpy()
        };

        saveArticleDeferred = $q.defer();
        articleService.articleInstance.save.andReturn(
            saveArticleDeferred.promise);

        Article = _Article_;
        fakeTextStats = {chars: 0, words: 0};
        spyOn(Article, 'textStats').andCallFake(function () {
            return fakeTextStats;
        });

        ArticleType = {
            getByName: jasmine.createSpy('ArticleType.getByName()')
        };
        getArticleTypeDeferred = $q.defer();
        ArticleType.getByName.andReturn(getArticleTypeDeferred.promise);

        ArticleCtrl = $controller('ArticleCtrl', {
            $scope: scope,
            article: articleService,
            Article: Article,
            ArticleType: ArticleType,
            mode: modeService,
            panes: panesService,
            platform: platformService
        });
    }));

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
            scope.article.title = 'The Title';
            scope.article.fields.body = 'Body text.';
        });

        it('invokes textStats() service method with correct parameters ' +
           'for a regular article field',
            function () {
                ArticleCtrl.fieldStatsText('body');
                expect(Article.textStats).toHaveBeenCalledWith('Body text.');
            }
        );

        it('invokes textStats() service method with correct parameters ' +
           'for the article title',
            function () {
                ArticleCtrl.fieldStatsText('title');
                expect(Article.textStats).toHaveBeenCalledWith('The Title');
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

    it('exposes article instance in scope', function () {
        expect(scope.article).toBe(articleService.articleInstance);
    });

    it('retrieves info on retrieved article\'s type', function () {
        expect(ArticleType.getByName).toHaveBeenCalledWith('news');
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

            scope.article.fields = {
                body: '<p>Paragraph 1</p>\n<p>Paragraph 2</p>',
                contentField: 'some content',
                seo_description: 'foo bar baz',
                isPayable: true
            };

            articleTypeNews = {
                name: 'news',
                fields: [
                    {
                        name: 'body',
                        type: 'text',
                        isHidden: false,
                        showInEditor: true
                    },
                    {
                        name: 'contentField',
                        type: 'text',
                        isHidden: false,
                        showInEditor: true
                    },
                    {
                        name:'printsection',
                        type: 'text',
                        isHidden: true,
                        showInEditor: false  // a non-content field
                    },
                    {
                        name:'seo_description',
                        type: 'text',
                        isHidden: false,
                        showInEditor: false  // a non-content field
                    },
                    {
                        name:'field_type_body',
                        type: 'body',
                        isHidden: false,
                        showInEditor: false  // a non-content field
                    },
                    {
                        name:'isPayable',
                        type: 'switch',
                        isHidden: false,
                        showInEditor: false  // a non-content field
                    }
                ]
            };
        }));

        it('exposes all article content fields from config in scope',
            function () {
                var match;

                getArticleTypeDeferred.resolve(articleTypeNews);
                scope.$digest();

                match = _(scope.editableFields).find({name: 'title'});
                expect(match).toBeDefined();
                match = _(scope.editableFields).find({name: 'body'});
                expect(match).toBeDefined();
            }
        );

        it('exposes article\'s non-content fields in scope', function () {
            var match;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            expect(scope.nonContentFields).toBeDefined();
            expect(scope.nonContentFields.length).toEqual(1);
            match = _(scope.nonContentFields).find({name: 'seo_description'});
            expect(match).toBeDefined();
        });

        it('does not expose article\'s content fields not found in config',
            function () {
                var match;

                getArticleTypeDeferred.resolve(articleTypeNews);
                scope.$digest();

                match = _(scope.editableFields).find({name: 'contentField'});
                expect(match).toBeUndefined();
            }
        );

        it('does not expose hidden fields in scope', function () {
            var match;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            match = _(scope.editableFields).find({name: 'printsection'});
            expect(match).toBeUndefined();
            match = _(scope.nonContentFields).find({name: 'printsection'});
            expect(match).toBeUndefined();
        });

        it('does not expose fields of type "switch" in scope', function () {
            var match;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            match = _(scope.editableFields).find({name: 'isPayable'});
            expect(match).toBeUndefined();
            match = _(scope.nonContentFields).find({name: 'isPayable'});
            expect(match).toBeUndefined();
        });

        it('does not expose fields of type "body" in scope', function () {
            var match;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            match = _(scope.editableFields).find({name: 'field_type_body'});
            expect(match).toBeUndefined();
            match = _(scope.nonContentFields).find({name: 'field_type_body'});
            expect(match).toBeUndefined();
        });

        it('sets empty article fields to their default text', function () {
            scope.article.fields.body = null;

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
                scope.save();
                expect(scope.article.save).toHaveBeenCalled();
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


    describe('scope\'s nonContentFieldChanged() method', function () {
        it('sets the article modified flag', function () {
            articleService.modified = false;
            scope.nonContentFieldChanged();
            expect(articleService.modified).toBe(true);
        });
    });

});
