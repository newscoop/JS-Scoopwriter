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

        beforeEach(function () {
            scope.article.fields = {
                body: '<p>Paragraph 1</p>\n<p>Paragraph 2</p>',
                contentField: 'some content',
                seo_description: 'foo bar baz',
                isPayable: true
            };
            scope.article.title = 'article title';

            articleTypeNews = {
                name: 'news',
                fields: [
                    {
                        name: 'body',
                        type: 'text',
                        fieldWeight: 12,
                        isHidden: false,
                        showInEditor: true  // content field
                    },
                    {
                        name: 'contentField',
                        type: 'text',
                        fieldWeight: 5,
                        isHidden: false,
                        showInEditor: true  // content field
                    },
                    {
                        name: 'contentField2',
                        type: 'text',
                        fieldWeight: 6,
                        isHidden: false,
                        showInEditor: true  // content field
                    },
                    {
                        name: 'hiddenContentField',
                        type: 'text',
                        fieldWeight: 24,
                        isHidden: true,
                        showInEditor: true  // content field
                    },
                    {
                        name:'printsection',
                        type: 'text',
                        fieldWeight: 3,
                        isHidden: true,
                        showInEditor: false  // a non-content field
                    },
                    {
                        name:'seo_description',
                        type: 'text',
                        fieldWeight: 1,
                        isHidden: false,
                        showInEditor: false  // a non-content field
                    },
                    {
                        name:'field_type_body',
                        type: 'body',
                        fieldWeight: 8,
                        isHidden: false,
                        showInEditor: false  // a non-content field
                    },
                    {
                        name:'isPayable',
                        type: 'switch',
                        fieldWeight: 7,
                        isHidden: false,
                        showInEditor: false  // a non-content field
                    },
                    {
                        name:'metaField_1',
                        type: 'text',
                        fieldWeight: 19,
                        isHidden: false,
                        showInEditor: false  // a non-content field
                    },
                    {
                        name:'metaField_2',
                        type: 'text',
                        fieldWeight: 16,
                        isHidden: false,
                        showInEditor: false  // a non-content field
                    },
                ]
            };
        });

        it('exposes article\'s non-hidden content fields and a title in scope',
            function () {
                var match;

                getArticleTypeDeferred.resolve(articleTypeNews);
                scope.$digest();

                match = _(scope.editableFields).find({name: 'body'});
                expect(match).toBeDefined();
                match = _(scope.editableFields).find({name: 'contentField'});
                expect(match).toBeDefined();
                match = _(scope.editableFields).find({name: 'contentField2'});
                expect(match).toBeDefined();
                match = _(scope.editableFields).find({name: 'title'});
                expect(match).toBeDefined();
            }
        );

        it('exposes article\'s non-content fields in scope', function () {
            var match;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            expect(scope.nonContentFields).toBeDefined();
            expect(scope.nonContentFields.length).toEqual(3);
            match = _(scope.nonContentFields).find({name: 'seo_description'});
            expect(match).toBeDefined();
            match = _(scope.nonContentFields).find({name: 'metaField_1'});
            expect(match).toBeDefined();
            match = _(scope.nonContentFields).find({name: 'metaField_2'});
            expect(match).toBeDefined();
        });

        it('does not expose hidden fields in scope', function () {
            var match;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            match = _(scope.editableFields).find({name: 'hiddenContentField'});
            expect(match).toBeUndefined();
            match = _(scope.nonContentFields).find({name: 'printsection'});
            expect(match).toBeUndefined();
        });

        it('does not expose fields of type "switch" in scope', function () {
            var match;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            match = _(scope.nonContentFields).find({name: 'isPayable'});
            expect(match).toBeUndefined();
        });

        it('does not expose fields of type "body" in scope', function () {
            var match;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            match = _(scope.nonContentFields).find({name: 'field_type_body'});
            expect(match).toBeUndefined();
        });

        it('correctly sorts the content fields list', function () {
            var maxWeight = -1,
                oldTitleOrder,
                titleSettings;

            titleSettings = AES_SETTINGS.articleTypeFields.news.title;
            oldTitleOrder = titleSettings.order;
            titleSettings.order = 3;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            // the title field must be at correct position and all other
            // fields' weights must be greater than or equal to field
            // weights of all the fields preceding them
            scope.editableFields.forEach(function (field, i) {
                if (field.name === 'title') {
                    expect(i).toEqual(2);  // an order of 3 means index 2
                    return;
                }

                if (i === 0) {
                    maxWeight = field.fieldWeight;
                } else {
                    expect(field.fieldWeight >= maxWeight).toBe(true);
                    maxWeight = field.fieldWeight;
                }
            });

            // restore original global setting
            titleSettings.order = oldTitleOrder;
        });

        it('correctly sorts the non-content fields list',  function () {
            var maxWeight = -1;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            // all fields' weights must be greater than or equal to field
            // weights of all the fields preceding them
            scope.nonContentFields.forEach(function (field, i) {
                if (i === 0) {
                    maxWeight = field.fieldWeight;
                } else {
                    expect(field.fieldWeight >= maxWeight).toBe(true);
                    maxWeight = field.fieldWeight;
                }
            });
        });

        it('sets empty article fields to default text', function () {
            scope.article.fields.body = null;

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            expect(scope.article.fields.body).toEqual('[default text]');
        });

        it('sets article title to default text if empty', function () {
            scope.article.title = '';

            getArticleTypeDeferred.resolve(articleTypeNews);
            scope.$digest();

            expect(scope.article.title).toEqual('[default text]');
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
