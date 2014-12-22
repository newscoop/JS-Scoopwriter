'use strict';

/**
* Module with tests for the ArticleActionsCtrl controller.
*
* @module ArticleActionsCtrl tests
*/

describe('Controller: ArticleActionsCtrl', function () {
    var Article,
        ArticleActionsCtrl,
        articleService,
        modeService,
        scope,
        toaster,
        $window;

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, $rootScope, $q, _Article_, _toaster_
    ) {
        scope = $rootScope.$new();
        Article = _Article_;
        toaster = _toaster_;
        modeService = {};

        articleService = {};
        articleService.articleInstance = {
            id: 1234,
            fields: {
                dateline: '1st Aug 2010',
                body: 'Body text.'
            },
            publication: {id: 11},
            issue: {number: 22},
            languageData: {id: 33},
            section: {number: 44},
            status: Article.wfStatus.SUBMITTED,
            setWorkflowStatus: jasmine.createSpy(),
            save: jasmine.createSpy(),
            releaseLock: jasmine.createSpy()
        };

        // mock $window to avoid "full page reload" error in tests
        $window = {
            location: {
                href: 'foo'
            }
        };

        ArticleActionsCtrl = $controller('ArticleActionsCtrl', {
            $scope: scope,
            $window: $window,
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

    it('exposes article constructor in scope', function () {
        expect(scope.Article).toBe(Article);
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

    it('sets scope\'s changingWfStatus flag to false by default', function () {
        expect(scope.changingWfStatus).toBe(false);
    });

    it('exposes the article object in scope', function () {
        expect(scope.article).toBe(articleService.articleInstance);
    });


    describe('on editor content change', function () {
        var alohaEditable;

        beforeEach(function () {
            alohaEditable = {
                triggerType: 'keypress',
                editable: {
                    originalObj: {
                        data: function () {
                            return 'body';  // return changed field's name
                        }
                    }
                }
            };
        });

        it('sets the article modified flag on article change',
            function () {
                articleService.modified = false;

                scope.article.fields.body = 'New body text.';
                scope.$emit('texteditor-content-changed', {}, alohaEditable);

                expect(articleService.modified).toBe(true);
            }
        );

        it('does *not* set the article modified flag if event\'s trigger ' +
            'type is "blur"',
            function () {

                articleService.modified = false;

                scope.article.fields.body = 'Whatever.';
                alohaEditable.triggerType = 'blur';
                scope.$emit('texteditor-content-changed', {}, alohaEditable);

                expect(articleService.modified).toBe(false);
            }
        );
    });


    it('sets workflow status in scope to the actual article status ' +
       'when the article is retrieved',
        function () {
            expect(scope.wfStatus).toEqual({
                value: Article.wfStatus.SUBMITTED,
                text: 'Submitted'
            });
        }
    );


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

            scope.article.setWorkflowStatus.andReturn(deferredStatus.promise);
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

    describe('scope\'s close() method', function () {
        var unlockDelay;

        beforeEach(inject(function ($q) {
            unlockDelay = $q.defer();
            scope.article.releaseLock.andReturn(unlockDelay.promise);
        }));

        it('tries to release the lock on article', function () {
            scope.close();
            expect(scope.article.releaseLock).toHaveBeenCalled();
        });

        it('redirects to the list of articles when lock is released',
            function () {
                var expectedUrl = [
                    AES_SETTINGS.API.rootURI, '/',
                    'admin/articles/index.php?',
                    'f_publication_id=11',
                    '&f_issue_number=22',
                    '&f_language_id=33',
                    '&f_section_number=44'
                ].join('');

                $window.location.href = 'abc';

                scope.close();
                unlockDelay.resolve();
                scope.$digest();

                expect($window.location.href).toEqual(expectedUrl);
            }
        );

        it('displays an error message if unlocking fails', function () {
            spyOn(toaster, 'add');

            scope.close();
            unlockDelay.reject();
            scope.$digest();

            expect(toaster.add).toHaveBeenCalledWith(
                {type: 'sf-error', message: 'Unlocking the article failed.'}
            );
        });
    });

    describe('scope\'s save() method', function () {
        var deferredSave;

        beforeEach(inject(function ($q) {
            deferredSave = $q.defer();
            scope.article.save.andReturn(deferredSave.promise);
        }));

        it('invokes article service with the article object as a parameter',
            function () {
                scope.save();
                expect(scope.article.save).toHaveBeenCalled();
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
