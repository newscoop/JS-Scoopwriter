'use strict';

/**
* Module with tests for the SlideshowsEditorCtrl controller.
*
* @module SlideshowsEditorCtrl tests
*/

describe('Controller: SlideshowsEditorCtrl', function () {
    var articleService,
        SlideshowsEditorCtrl,
        $httpBackend,
        $modal,
        rootScope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller,
        _$modal_,
        _$httpBackend_,
        $q,
        $templateCache,
        article,
        $rootScope
    ) {
        var modalTemplate;

        $httpBackend = _$httpBackend_;
        $modal = _$modal_;
        articleService = article;

        articleService.articleInstance = {
            articleId: 123,
            language: 'de',
            languageData: {
                id: 5,
                name: 'German'
            }
        };

        rootScope = $rootScope.$new();
        spyOn(rootScope, '$broadcast');
        spyOn($modal, 'open').andCallThrough();
        modalTemplate = $templateCache.get(
            'app/views/modal-slideshows-editor.html');
        $httpBackend.whenGET('views/modal-slideshows-editor.html')
            .respond(200, modalTemplate);

        SlideshowsEditorCtrl = $controller('SlideshowsEditorCtrl', {
            article: articleService,
            $modal: $modal
        });
    }));

    describe('openSlideshowsEditor() method', function () {
        it('opens a modal to edit slideshow', function () {
            var callArgs,
                expectedInfo;

            SlideshowsEditorCtrl.openSlideshowsEditor('edit', 1);

            expect($modal.open).toHaveBeenCalled();
            callArgs = $modal.open.mostRecentCall.args[0];

            expect(callArgs.templateUrl).toEqual(
                'views/modal-slideshows-editor.html');
            expect(callArgs.controllerAs).toEqual('modalSlideshowsEditorCtrl');

            expectedInfo = {
                articleId: 123,
                action: 'edit',
                slideshowId: 1
            };
            expect(callArgs.resolve.info())
                .toEqual(expectedInfo);
        });

        it('opens a modal to create slideshow', function () {
            var callArgs,
                expectedInfo;

            SlideshowsEditorCtrl.openSlideshowsEditor('create');

            expect($modal.open).toHaveBeenCalled();
            callArgs = $modal.open.mostRecentCall.args[0];

            expect(callArgs.templateUrl).toEqual(
                'views/modal-slideshows-editor.html');
            expect(callArgs.controllerAs).toEqual('modalSlideshowsEditorCtrl');

            expectedInfo = {
                articleId: 123,
                action: 'create'
            };
            expect(callArgs.resolve.info())
                .toEqual(expectedInfo);
        });

        it('opens a modal to attach slideshow', function () {
            var callArgs,
                expectedInfo;

            SlideshowsEditorCtrl.openSlideshowsEditor('attach');

            expect($modal.open).toHaveBeenCalled();
            callArgs = $modal.open.mostRecentCall.args[0];

            expect(callArgs.templateUrl).toEqual(
                'views/modal-slideshows-editor.html');
            expect(callArgs.controllerAs).toEqual('modalSlideshowsEditorCtrl');

            expectedInfo = {
                articleId: 123,
                action: 'attach'
            };
            expect(callArgs.resolve.info())
                .toEqual(expectedInfo);
        });
    });

    describe('modal\'s controller', function () {
        var ctrl,
            fakeModalInstance,
            infoParam,
            fakeSCE,
            ModalCtrl;

        beforeEach(function () {
            SlideshowsEditorCtrl.openSlideshowsEditor();

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
                    return url;
                }
            };

            infoParam = {
                articleId: 111,
            };

            ctrl = new ModalCtrl(fakeModalInstance, fakeSCE, infoParam, rootScope);
        });

        it('exposes correct edit slideshow URL', function () {
            var expectedUrl = [
                'http://server.net',
                '/admin/slideshow/edit',
                '/article_number/111',
                '/slideshow/1'
            ].join('');

            infoParam.action = 'edit';
            infoParam.slideshowId = 1;

            ctrl = new ModalCtrl(fakeModalInstance, fakeSCE, infoParam, rootScope);

            expect(ctrl.url).toEqual(expectedUrl);
        });

        it('exposes correct create slideshow URL', function () {
            var expectedUrl = [
                'http://server.net',
                '/admin/slideshow/create',
                '/article_number/111'
            ].join('');

            infoParam.action = 'create';
            infoParam.slideshowId = 1;

            ctrl = new ModalCtrl(fakeModalInstance, fakeSCE, infoParam, rootScope);

            expect(ctrl.url).toEqual(expectedUrl);
        });

        it('exposes correct attach slideshow URL', function () {
            var expectedUrl = [
                'http://server.net',
                '/admin/slideshow/attach',
                '/article_number/111'
            ].join('');

            infoParam.action = 'attach';
            infoParam.slideshowId = 1;

            ctrl = new ModalCtrl(fakeModalInstance, fakeSCE, infoParam, rootScope);

            expect(ctrl.url).toEqual(expectedUrl);
        });

        it('exposes empty URL when not existing action provided', function () {
            var expectedUrl = [
                'http://server.net',
                '/admin/slideshow/attach',
                '/article_number/111'
            ].join('');

            infoParam.action = 'other';
            infoParam.slideshowId = 1;

            ctrl = new ModalCtrl(fakeModalInstance, fakeSCE, infoParam, rootScope);

            expect(ctrl.url).not.toEqual(expectedUrl);
            expect(ctrl.url).toEqual("");
        });

        describe('close() method', function () {
            it("should broadcast 'close-slideshow-modal' and close the modal", function() {
                ctrl.close();
                expect(rootScope.$broadcast).toHaveBeenCalledWith('close-slideshow-modal');
                expect(fakeModalInstance.close).toHaveBeenCalled();
            });
        });
    });

});
