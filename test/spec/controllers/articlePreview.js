'use strict';

/**
* Module with tests for the ArticlePreviewCtrl controller.
*
* @module ArticlePreviewCtrl tests
*/

describe('Controller: ArticlePreviewCtrl', function () {
    var articleData,
        articleDeferred,
        articleService,
        articlePreviewCtrl,
        $httpBackend,
        $modal,
        $rootScope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, _$modal_, _$httpBackend_, $q, _$rootScope_,
        $templateCache, article
    ) {
        var modalTemplate;

        $httpBackend = _$httpBackend_
        $modal = _$modal_;
        $rootScope = _$rootScope_;
        articleService = article;

        articleDeferred = $q.defer();
        articleService.promise = articleDeferred.promise;
        articleData = {
            number: 123,
            language: 'de',
            issue: {
                number: 129
            },
            section: {
                number: 10
            }
        };

        spyOn($modal, 'open').andCallThrough();
        modalTemplate = $templateCache.get(
            'app/views/modal-article-preview.html');
        $httpBackend.whenGET('views/modal-article-preview.html')
            .respond(200, modalTemplate);

        articlePreviewCtrl = $controller('ArticlePreviewCtrl', {
            article: articleService,
            $modal: $modal
        });
    }));

    describe('openPreview() method', function () {
        it('opens a modal with correct parameters', function () {
            var callArgs,
                expectedArticleInfo;

            articlePreviewCtrl.openPreview();
            articleDeferred.resolve(articleData);
            $rootScope.$apply();

            expect($modal.open).toHaveBeenCalled();
            callArgs = $modal.open.mostRecentCall.args[0];

            expect(callArgs.templateUrl).toEqual(
                'views/modal-article-preview.html');
            expect(callArgs.controllerAs).toEqual('modalPreviewCtrl');

            expectedArticleInfo = {
                articleId: 123,
                languageId: 5,
                publicationId: 1,
                issueId: 129,
                sectionId: 10
            };
            expect(callArgs.resolve.articleInfo())
                .toEqual(expectedArticleInfo);
        });
    });

    describe('modal\'s controller', function () {
        var ctrl,
            fakeModalInstance;

        beforeEach(function () {
            var articleInfoParam,
                fakeConfig,
                fakeSCE,
                ModalCtrl;

            articlePreviewCtrl.openPreview();
            articleDeferred.resolve(articleData);
            $httpBackend.flush();
            $rootScope.$apply();

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
                    return url
                }
            };

            articleInfoParam = {
                articleId: 111,
                languageId: 222,
                publicationId: 333,
                issueId: 444,
                sectionId: 555
            };

            fakeConfig = {
                API: {
                    rootURI: 'http://foo.bar'
                }
            };

            ctrl = new ModalCtrl(
                fakeModalInstance, fakeSCE, articleInfoParam, fakeConfig
            );

        });

        it('exposes correct preview URL', function () {
            var expectedUrl = [
                'http://foo.bar',
                '/admin/articles/preview.php?',
                'f_publication_id=333',
                '&f_issue_number=444',
                '&f_section_number=555',
                '&f_article_number=111',
                '&f_language_id=222',
                '&f_language_selected=222'
            ].join('');

            expect(ctrl.url).toEqual(expectedUrl);
        });

        describe('close() method', function () {
            it('closes the modal', function () {
                ctrl.close();
                expect(fakeModalInstance.close).toHaveBeenCalled();
            });
        });
    });

});
