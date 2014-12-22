'use strict';

/**
* Module with tests for the attach image controller.
*
* @module AttachImageCtrl controller tests
*/

describe('Controller: AttachImageCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var AttachImageCtrl,
        fakeImagesService,
        modal,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, _modal_) {
        scope = $rootScope.$new();
        modal = _modal_;

        fakeImagesService = {};

        AttachImageCtrl = $controller('AttachImageCtrl', {
            $scope: scope,
            images: fakeImagesService
        });
    }));

    it('sets API root URL in scope', function () {
        expect(scope.root).toEqual(AES_SETTINGS.API.rootURI);
    });

    it('proxies images', function () {
        expect(scope.images).toBeDefined();
    });

    it('has the "archive" source selected by default', function () {
        expect(scope.selected).toEqual({
            value : 'archive',
            url : 'views/attach-image/archive.html',
            description : 'Media Archive'
        });
    });

    describe('scope\'s select() method', function () {
        it('sets given source as the new selected source', function () {
            var newSelected = {
                value: 'foo',
                url: 'views/bar.html',
                description: 'Some image source'
            };
            scope.select(newSelected);
            expect(scope.selected).toEqual(newSelected);
        });
    });

    describe('scope\'s attachCollected() method', function () {
        beforeEach(function () {
            fakeImagesService.attachAllCollected = jasmine.createSpy();
            fakeImagesService.discardAll = jasmine.createSpy();
            spyOn(modal, 'hide');
        });

        it('triggers attaching all images currently in basket', function () {
            scope.attachCollected();
            expect(fakeImagesService.attachAllCollected).toHaveBeenCalled();
        });

        it('triggers clearing the basket and upload list', function () {
            scope.attachCollected();
            expect(fakeImagesService.discardAll).toHaveBeenCalled();
        });

        it('closes the modal', function () {
            scope.attachCollected();
            expect(modal.hide).toHaveBeenCalled();
        });
    });

    describe('scope\'s discardChanges() method', function () {
        var eventObj;

        beforeEach(function () {
            fakeImagesService.discardAll = jasmine.createSpy();
            spyOn(modal, 'hide');
            eventObj = {
                preventDefault: function () {},
                stopPropagation: function () {}
            };
        });

        it('triggers discarding all the changes', function () {
            scope.discardChanges(eventObj);
            expect(fakeImagesService.discardAll).toHaveBeenCalled();
        });

        it('closes the modal', function () {
            scope.discardChanges(eventObj);
            expect(modal.hide).toHaveBeenCalled();
        });
    });

});
