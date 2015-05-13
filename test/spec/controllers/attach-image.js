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
    beforeEach(inject(function ($q, $controller, $rootScope, _modal_) {
        scope = $rootScope.$new();
        modal = _modal_;

        fakeImagesService = {
            attachAllCollected: $q.defer(),
            discardAll: $q.defer()
        };

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
        var deferred,
            toaster;

        beforeEach(inject(function ($q, _toaster_) {
            deferred = $q.defer(); 
            toaster = _toaster_;
            spyOn(fakeImagesService, 'attachAllCollected').andReturn(deferred.promise);
            spyOn(fakeImagesService, 'discardAll').andReturn(deferred.promise);
            spyOn(toaster, 'add').andReturn(deferred.promise);
            spyOn(modal, 'hide');
        }));

        it('triggers attaching all images currently in basket', function () {
            scope.attachCollected();
            deferred.resolve(true);
            scope.$digest();
            expect(fakeImagesService.attachAllCollected).toHaveBeenCalled();
        });

        it('triggers clearing the basket and upload list', function () {
            scope.attachCollected();
            deferred.resolve(true);
            scope.$digest();
            expect(fakeImagesService.discardAll).toHaveBeenCalled();
        });

        it('calls toaster.add with correct params on success', function () {
            scope.attachCollected();
            deferred.resolve(true);
            scope.$digest();
            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.images.attach.success'
            });
        });

        it('calls toaster.add with correct params on error', function () {
            scope.attachCollected();
            deferred.reject(false);
            scope.$digest();
            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.images.attach.error'
            });
        });

        it('closes the modal', function () {
            scope.attachCollected();
            deferred.resolve(true);
            scope.$digest();
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
