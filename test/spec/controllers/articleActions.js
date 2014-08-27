'use strict';

/**
* Module with tests for the ArticleActionsCtrl controller.
*
* @module ArticleActionsCtrl tests
*/

describe('Controller: ArticleActionsCtrl', function () {
    var ArticleActionsCtrl,
        articleService,
        getArticleDeferred,
        modeService,
        scope;

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($controller, $rootScope, $q, article) {
        articleService = article;

        scope = $rootScope.$new();
        modeService = {};

        getArticleDeferred = $q.defer();
        articleService.promise = getArticleDeferred.promise;
        spyOn(articleService, 'setWorkflowStatus');
        spyOn(articleService, 'save');

        ArticleActionsCtrl = $controller('ArticleActionsCtrl', {
            $scope: scope,
            article: articleService,
            mode: modeService
        });

        spyOn(scope, 'setModified').andCallThrough();
    }));

    it('exposes mode service in scope', function () {
        expect(scope.mode).toBe(modeService);
    });

    it('exposes article service in scope', function () {
        expect(scope.articleService).toBe(articleService);
    });

    it('initializes article workflow status options in scope', function () {
        var expected = [
            {value: 'N', text: 'New'},
            {value: 'S', text: 'Submitted'},
            {value: 'Y', text: 'Published'},
            {value: 'M', text: 'Published with issue'}
        ];
        expect(scope.workflowStatuses).toEqual(expected);
    });

    it('sets the selected article workflow status option to NEW by default',
        function () {
            expect(scope.wfStatus).toEqual({value: 'N', text: 'New'});
        }
    );

    it('sets scope\'s changingWfStatus flag to false by default', function () {
        expect(scope.changingWfStatus).toBe(false);
    });

    describe('when article is retrieved', function () {
        it('exposes the article in scope', function () {
            scope.article = undefined;
            getArticleDeferred.resolve({id: 1234});
            scope.$digest();
            expect(scope.article).toEqual({id: 1234});
        });

        it('sets the article modified flag from the 2nd article change on',
            function () {
                var article = {
                    id: 1234,
                    fields: {
                        dateline: '1st Aug 2010',
                        body: 'Body text.'
                    }
                };

                getArticleDeferred.resolve(article);
                scope.$digest();

                articleService.modified = false;
                article.fields.body = 'New body text.';
                scope.$digest();
                article.fields.body = 'New body text (2).';
                scope.$digest();

                expect(articleService.modified).toBe(true);
            }
        );

        it('does not set the article modified on the first article change',
            function () {
                var article = {
                    id: 1234,
                    fields: {
                        dateline: '1st Aug 2010',
                        body: 'Body text.'
                    }
                };

                getArticleDeferred.resolve(article);
                scope.$digest();

                articleService.modified = false;
                article.fields.body = 'New body text.';
                scope.$digest();

                expect(articleService.modified).toBe(false);
            }
        );

        it('sets workflow status in scope to the actual article status ' +
           'when the article is retrieved',
            function () {
                scope.workflowStatuses = [
                    {value: 'A', text: 'Status A'},
                    {value: 'B', text: 'Status B'},
                    {value: 'C', text: 'Status C'}
                ];
                scope.wfStatus = {value: 'A', text: 'Status A'};

                getArticleDeferred.resolve({id: 123, status: 'B'});
                scope.$digest();

                expect(scope.wfStatus).toEqual({value: 'B', text: 'Status B'});
            }
        );
    });

    describe('scope\'s setWorkflowStatus() method', function () {
        var deferredStatus;

        beforeEach(inject(function ($q) {
            deferredStatus = $q.defer();

            scope.workflowStatuses = [
                {value: 'A', text: 'Status A'},
                {value: 'B', text: 'Status B'},
                {value: 'C', text: 'Status C'}
            ];
            scope.wfStatus = {value: 'A', text: 'Status A'};

            articleService.setWorkflowStatus.andReturn(deferredStatus.promise);
        }));

        it('sets changingWfStatus flag before sending a request', function () {
            scope.changingWfStatus = false;
            scope.setWorkflowStatus('B');
            expect(scope.changingWfStatus).toBe(true);
        });

        it('clears changingWfStatus flag on success', function () {
            scope.setWorkflowStatus('B');
            scope.changingWfStatus = true;

            deferredStatus.resolve();
            scope.$digest();

            expect(scope.changingWfStatus).toBe(false);
        });

        it('clears changingWfStatus flag on error', function () {
            scope.setWorkflowStatus('B');
            scope.changingWfStatus = true;

            deferredStatus.reject('server timeout');
            scope.$digest();

            expect(scope.changingWfStatus).toBe(false);
        });

        it('updates workflow status in scope on success', function () {
            scope.setWorkflowStatus('B');

            deferredStatus.resolve();
            scope.$digest();

            expect(scope.wfStatus).toEqual(
                {value: 'B', text: 'Status B'});
        });
    });

    describe('scope\'s save() method', function () {
        var deferredSave;

        beforeEach(inject(function ($q) {
            deferredSave = $q.defer();
            articleService.save.andReturn(deferredSave.promise);
        }));

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
            deferredSave.resolve();
            scope.$digest();

            expect(articleService.modified).toBe(false);
        });
    });

    describe('scope\'s setModified() method', function () {
        it('correctly sets the article modified flag', function () {
            articleService.modified = false;
            scope.setModified(true);
            expect(articleService.modified).toBe(true);
        });

        it('correctly clears the article modified flag', function () {
            articleService.modified = true;
            scope.setModified(false);
            expect(articleService.modified).toBe(false);
        });
    });

});
