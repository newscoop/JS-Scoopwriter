'use strict';

/**
* Module with tests for the topics pane controller.
*
* @module PaneRelatedArticlesCtrl controller tests
*/
describe('Controller: PaneRelatedArticlesCtrl', function () {

    beforeEach(module('authoringEnvironmentApp'));

    var articleService,
        PaneRelatedArticlesCtrl,
        mockedArticles,
        articlesDefered,
        articles,
        Publication,
        Issue,
        Section,
        mockedPublications,
        mockedIssues,
        mockedSections,
        previewArticle,
        $q,
        $rootScope;

    mockedArticles = [
        { "language":"de", "articleId":"447" },
        { "language":"de", "articleId":"175832" }
    ];
    
    mockedPublications = [
        { 'name': 'pub one', 'id': 1 }
    ],

    mockedIssues = [
        { 'title': 'issue one', 'number': 1 }, 
        { 'title': 'issue two', 'number': 2 }
    ],

    mockedSections = [
        { 'title': 'section one', 'number': 1 },
        { 'title': 'section two', 'number': 2 }
    ],

    beforeEach(inject(function (
        $controller,
        _$q_, 
        _$rootScope_, 
        _article_,
        _Publication_,
        _Issue_,
        _Section_
    ) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        articleService = _article_;
        Publication = _Publication_;
        Issue = _Issue_;
        Section = _Section_;
        articlesDefered = $q.defer();
        articles = angular.copy(mockedArticles);
        articles.$promise = articlesDefered.promise;

        articleService.articleInstance = {
            articleId: 17,
            language: 'it',
            getRelatedArticles: function() {}
        };
        spyOn(articleService.articleInstance, 'getRelatedArticles').andReturn(articles);

        spyOn(Publication, 'getAll').andReturn(mockedPublications);
        spyOn(Issue, 'getAll').andReturn(mockedIssues);
        spyOn(Section, 'getAll').andReturn(mockedSections);

        PaneRelatedArticlesCtrl = $controller('PaneRelatedArticlesCtrl', {
            article: articleService
        });

    }));

    it('initializes articlesSearchResults to empty list', function () {
        expect(PaneRelatedArticlesCtrl.articlesSearchResults).toEqual([]);
    });

    it('initializes articlesSearchResultsListRetrieved to true', function () {
        expect(PaneRelatedArticlesCtrl.articlesSearchResultsListRetrieved).toBe(true);
    });

    it('initializes assignedRelatedArticles to article list', function () {
        expect(PaneRelatedArticlesCtrl.assignedRelatedArticles).toEqual(articles);
    });

    it('initializes assigningRelatedArticles flag to false', function () {
        expect(PaneRelatedArticlesCtrl.assigningRelatedArticles).toBe(false);
    });

    it('initializes previewLoaded flag to true', function () {
        expect(PaneRelatedArticlesCtrl.previewLoaded).toBe(true);
    });

    it('initializes availablePublications with correct array', function () {
        expect(PaneRelatedArticlesCtrl.availablePublications).toEqual(mockedPublications);
    });

    it('initializes availableIssues correct array', function () {
        expect(PaneRelatedArticlesCtrl.availableIssues).toEqual(mockedIssues);
    });
    it('initializes availableSections correct array', function () {
        expect(PaneRelatedArticlesCtrl.availableSections).toEqual(mockedSections);
    });

    it('initializes assignedRelatedArticles to article list', function () {
        expect(PaneRelatedArticlesCtrl.assignedRelatedArticles).toEqual(articles);
    });

    describe('loadAvailableFilters() method', function () {
        beforeEach(inject(function () {
            PaneRelatedArticlesCtrl.availableSections = [];
            PaneRelatedArticlesCtrl.availableIssues = [];
            PaneRelatedArticlesCtrl.loadAvailableFilters();
        }));

        it('sets availableSections and availableIssues', function () {
            expect(PaneRelatedArticlesCtrl.availableSections).toEqual(mockedSections);
            expect(PaneRelatedArticlesCtrl.availableIssues).toEqual(mockedIssues);
        });
    });

    describe('previewRelatedArticle() method', function () {
        var fakePreviewArticle,
            fakePreviewUrl,
            deferedContentFields,
            deferedFirstImage;

        beforeEach(inject(function ($q) {
            deferedContentFields = $q.defer();
            deferedFirstImage = $q.defer();
            fakePreviewArticle = {
                articleId: 1,
                language: 'en',
                contentFields: null,
                firstImage: null,
                editorUrl: null
            },
            fakePreviewUrl = Routing.generate(
                'newscoop_admin_aes',
                {
                    articleNumber: 1,
                    language: 'en'
                },
                true
            );
           
            fakePreviewArticle.loadContentFields = jasmine
                .createSpy('loadContentFields')
                .andReturn(deferedContentFields.promise);
            fakePreviewArticle.loadFirstImage = jasmine
                .createSpy('loadFirstImage')
                .andReturn(deferedFirstImage.promise);
            PaneRelatedArticlesCtrl.previewRelatedArticle(fakePreviewArticle);
        }));

        it('sets the correct previewArticle.editorUrl', function () {
            expect(fakePreviewArticle.loadContentFields).toHaveBeenCalled();
            deferedContentFields.resolve(['body', 'lead']);
            $rootScope.$apply();
            expect(fakePreviewArticle.editorUrl).toEqual(fakePreviewUrl);
        });
        it('sets contentFields on the previewArticle', function () {
            expect(fakePreviewArticle.loadContentFields).toHaveBeenCalled();
            deferedContentFields.resolve(['body', 'lead']);
            $rootScope.$apply();
            expect(fakePreviewArticle.contentFields).toEqual(['body', 'lead']);
        });
        it('sets firstImage on the previewArticle', function () {
            var oldRootURI = AES_SETTINGS.API.rootURI;
            AES_SETTINGS.API.rootURI = 'fake';

            expect(fakePreviewArticle.loadFirstImage).toHaveBeenCalled();
            deferedFirstImage.resolve('firstimage.png');
            $rootScope.$apply();
            expect(fakePreviewArticle.firstImage).toEqual('fake/images/firstimage.png');

            AES_SETTINGS.API.rootURI = oldRootURI;
        });
        it('sets previewLoaded flag to true', function () {
            deferedContentFields.resolve(['body', 'lead']);
            $rootScope.$apply();
            expect(PaneRelatedArticlesCtrl.previewLoaded).toBe(true);
        });
    });

    describe('clearPreview() method', function () {
        var fakePreviewArticle;

        beforeEach(inject(function ($q) {
            fakePreviewArticle = {
                articleId: 1,
                title: 'title',
                contentFields: [ 'content' ],
                firstImage: 'image.png' 
            };
           
            PaneRelatedArticlesCtrl.relatedArticlePreview = fakePreviewArticle;
        }));

        it('sets previewLoaded flag to false', function () {
            PaneRelatedArticlesCtrl.clearPreview();
            expect(PaneRelatedArticlesCtrl.previewLoaded).toBe(false);
        });

        it('clears relatedArticlePreview', function () {
            PaneRelatedArticlesCtrl.clearPreview();
            expect(PaneRelatedArticlesCtrl.relatedArticlePreview.title).toBe(null);
            expect(PaneRelatedArticlesCtrl.relatedArticlePreview.lead).toBe(null);
            expect(PaneRelatedArticlesCtrl.relatedArticlePreview.firstImage).toEqual(' ');
            expect(fakePreviewArticle.contentFields).toBe(null);
        });

        it('sets showArticlePreview to FALSE', function () {
            PaneRelatedArticlesCtrl.clearPreview();
            expect(PaneRelatedArticlesCtrl.showArticlePreview).toBe(false);
        });
    });

    describe('orderChange() method', function () {
        var fakeArticle,
            deferedOrder;
        beforeEach(inject(function ($q) {
            deferedOrder = $q.defer();
            fakeArticle = {
                articleId: 1,
                title: 'title',
                contentFields: [ 'content' ],
                firstImage: 'image.png' 
            };
           
            PaneRelatedArticlesCtrl.article.setOrderOfRelatedArticles = jasmine
                .createSpy('setOrderOfRelatedArticles')
                .andReturn(deferedOrder.promise); 
            PaneRelatedArticlesCtrl.orderChange(fakeArticle, 1);
        }));

        it('invokes article\'s setOrderOfRelatedArticles() method ' +
            'with correct parameters',
            function () {
                PaneRelatedArticlesCtrl.orderChange(fakeArticle, 1);
                deferedOrder.resolve();
                $rootScope.$apply();

                expect(PaneRelatedArticlesCtrl.article.setOrderOfRelatedArticles).
                    toHaveBeenCalledWith(fakeArticle, 1);
            }
        );
    });

    describe('clearSearch() method', function () {
        var fakePreviewArticle;

        beforeEach(inject(function ($q) {
            fakePreviewArticle = {
                articleId: 1,
                title: 'title',
                contentFields: [ 'content' ],
                firstImage: 'image.png' 
            };
           
            PaneRelatedArticlesCtrl.articlesSearchResults = [fakePreviewArticle];
            PaneRelatedArticlesCtrl.query = 'query string';
        }));

        it('sets query to null', function () {
            PaneRelatedArticlesCtrl.clearSearch();
            expect(PaneRelatedArticlesCtrl.query).toBe(null);
        });

        it('sets articlesSearchResultsListRetrieved to true', function () {
            PaneRelatedArticlesCtrl.clearSearch();
            expect(PaneRelatedArticlesCtrl.articlesSearchResultsListRetrieved).toBe(true);
        });

        it('clears articlesSearchResults', function () {
            PaneRelatedArticlesCtrl.clearSearch();
            expect(PaneRelatedArticlesCtrl.articlesSearchResults).toEqual([]);
        });

    });

    describe('buildFilters() method', function () {
        var filters,
            mockedFilters;

        beforeEach(inject(function () {
            PaneRelatedArticlesCtrl.publicationFilter = {'id':1};
            PaneRelatedArticlesCtrl.issueFilter = {'number':1};
            PaneRelatedArticlesCtrl.sectionFilter = {'number':1};
            mockedFilters = {
                'publication': 1,
                'issue': 1,
                'section': 1
            }
            filters = PaneRelatedArticlesCtrl.buildFilters();
        }));

        it('returns a valid filter object', function () {
            expect(filters).toEqual(mockedFilters);
        });
    });

    describe('assignToArticle() method', function () {
        var deferedAssign,
            relatedArticle;

        beforeEach(inject(function($q) {
            deferedAssign = $q.defer();

            relatedArticle = {
                articleId: 20,
                language: 'de',
            };

            relatedArticle.$promise = deferedAssign.promise;

            PaneRelatedArticlesCtrl.assignedRelatedArticles = [];
            PaneRelatedArticlesCtrl.article.addRelatedArticle = jasmine
                .createSpy('assignRelatedArticle')
                .andReturn(deferedAssign.promise); 
            PaneRelatedArticlesCtrl.loadSearchResults = jasmine
                .createSpy('loadSearchResults')
                .andReturn([]); 

        }));

        it('sets assigningRelatedArticles flag to false', function () {
            PaneRelatedArticlesCtrl.assigningRelatedArticles = false;
            PaneRelatedArticlesCtrl.assignToArticle(relatedArticle);
            expect(PaneRelatedArticlesCtrl.assigningRelatedArticles).toBe(true);
        });

        it('sets assignedRelatedArticles to new article list', function () {
            PaneRelatedArticlesCtrl.assignToArticle(relatedArticle);
            deferedAssign.resolve();
            $rootScope.$apply();
            expect(PaneRelatedArticlesCtrl.assignedRelatedArticles).toEqual([relatedArticle]);
        });
    });

    describe('previewRelatedArticle() method', function () {
        var previewArticle,
            deferedContent,
            deferedImage;

        beforeEach(inject(function ($q) {
            deferedContent = $q.defer();
            deferedImage = $q.defer();
            previewArticle = {
                'articleId': 1,
                'language': 'de'
            }

            previewArticle.loadContentFields = jasmine
                .createSpy('loadContentFields')
                .andReturn(deferedContent.promise); 
            previewArticle.loadFirstImage = jasmine
                .createSpy('loadFirstImage')
                .andReturn(deferedImage.promise); 
        }));

        it('sets relatedArticlePreview to the correct article', function () {
            PaneRelatedArticlesCtrl.relatedArticlePreview = null;
            PaneRelatedArticlesCtrl.previewRelatedArticle(previewArticle);
            expect(PaneRelatedArticlesCtrl.relatedArticlePreview).toEqual(previewArticle);
        });

        it('sets relatedArticlePreview to the correct article', function () {
            PaneRelatedArticlesCtrl.showArticlePreview = false;
            PaneRelatedArticlesCtrl.previewRelatedArticle(previewArticle);
            expect(PaneRelatedArticlesCtrl.showArticlePreview).toEqual(true);
        });
    });

    describe('loadSearchResults() method', function () {
        var deferedSearch,
            ignoredResults;

        beforeEach(inject(function ($q) {
            deferedSearch = $q.defer();

            ignoredResults = [
                {'articleId': 1, language: 'de'}
            ];
            PaneRelatedArticlesCtrl.article.searchArticles = jasmine
                .createSpy('searchArticles')
                .andReturn(deferedSearch.promise); 
        }));

        it('sets ignored object correctly', function () {
            PaneRelatedArticlesCtrl.assignedRelatedArticles = ignoredResults;
            PaneRelatedArticlesCtrl.loadSearchResults();
            deferedSearch.resolve([
                {articleId: 1},
                {articleId: 2},
            ]);
            $rootScope.$apply();
            expect(PaneRelatedArticlesCtrl.articlesSearchResults).toEqual([{articleId: 2}]);
        });

        it('sets articlesSearchResultsListRetrieved to true', function () {
            PaneRelatedArticlesCtrl.articlesSearchResultsListRetrieved = false;
            PaneRelatedArticlesCtrl.loadSearchResults();
            deferedSearch.resolve();
            $rootScope.$apply();
            expect(PaneRelatedArticlesCtrl.articlesSearchResultsListRetrieved).toEqual(true);
        });

        it('sets articlesSearchResults', function () {
            PaneRelatedArticlesCtrl.loadSearchResults();
            deferedSearch.resolve([{articleId: 1}]);
            $rootScope.$apply();
            expect(PaneRelatedArticlesCtrl.articlesSearchResults).toEqual([{articleId: 1}]);
        });
    });

    describe('confirmUnassignRelatedArticle() method', function () {
        var deferedRemove,
            relatedArticle,
            modalDefered,
            modalFactory;

        beforeEach(inject(function ($q, _modalFactory_) {
            modalDefered = $q.defer();
            deferedRemove = $q.defer();
            modalFactory = _modalFactory_;

            spyOn(modalFactory, 'confirmLight').andCallFake(function () {
                return {
                    result: modalDefered.promise
                };
            });

            relatedArticle = {
                articleId: 20,
                language: 'de',
            };

            PaneRelatedArticlesCtrl.article.removeRelatedArticle = jasmine
                .createSpy('removeRelatedArticle')
                .andReturn(deferedRemove); 
        }));

        it('opens a "light" confirmation dialog', function () {
            PaneRelatedArticlesCtrl.confirmUnassignRelatedArticle(relatedArticle);
            expect(modalFactory.confirmLight).toHaveBeenCalled();
        });

        it('invokes relatedArticle\'s removeRelatedArticle() method ' +
            'with correct parameters on action confirmation',
            function () {
                PaneRelatedArticlesCtrl.confirmUnassignRelatedArticle(relatedArticle);
                modalDefered.resolve();
                $rootScope.$apply();

                expect(PaneRelatedArticlesCtrl.article.removeRelatedArticle).
                    toHaveBeenCalledWith({ articleId : 20, language : 'de' });
            }
        );

        it('does not try to unassign relatedArticle on action cancellation',
            function () {
                PaneRelatedArticlesCtrl.confirmUnassignRelatedArticle(relatedArticle);
                modalDefered.reject();
                $rootScope.$apply();

                expect(PaneRelatedArticlesCtrl.article.removeRelatedArticle).not.toHaveBeenCalled();
            }
        );

        it('removes the relatedArticle from the list of related articles ' +
           'on action confirmation',
           function () {
                PaneRelatedArticlesCtrl.assignedRelatedArticles = [
                    {articleId: 4, title: 'article 4'},
                    {articleId: 20, title: 'article 20'},
                    {articleId: 8, title: 'article 8'}
                ];

                PaneRelatedArticlesCtrl.confirmUnassignRelatedArticle(relatedArticle);
                modalDefered.resolve();
                deferedRemove.resolve();
                $rootScope.$apply();

                expect(PaneRelatedArticlesCtrl.assignedRelatedArticles).toEqual(
                    [{articleId: 4, title: 'article 4'}, {articleId: 8, title: 'article 8'}]
                );
            }
        );
    });
});
