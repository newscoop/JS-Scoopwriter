'use strict';

/**
* Module with tests for the media archive controller.
*
* @module MediaArchiveCtrl controller tests
*/

describe('Controller: MediaArchiveCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var MediaArchiveCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        MediaArchiveCtrl = $controller('MediaArchiveCtrl', {
            $scope: scope
        });
    }));

    it('should attach a list of images to the scope', function () {
        expect(scope.images).toBeDefined();
        expect(scope.images.displayed.length).toBe(0);
    });

    it('sets `root` property on scope holding API root URL', function () {
        expect(scope.root).toEqual('http://newscoop.aes.sourcefabric.net');
    });

    describe('scope\'s thumbnailClicked() method', function () {
        var images;

        beforeEach(inject(function (_images_) {
            images = _images_;
            spyOn(images, 'toggleCollect');
        }));

        it('does nothing if clicked image is already attached', function () {
            spyOn(images, 'isAttached').andReturn(true);
            spyOn(images, 'isCollected').andReturn(false);
            scope.thumbnailClicked(123);
            expect(images.toggleCollect).not.toHaveBeenCalled();
        });

        it('does nothing if clicked image is in the basket', function () {
            spyOn(images, 'isAttached').andReturn(false);
            spyOn(images, 'isCollected').andReturn(true);
            scope.thumbnailClicked(123);
            expect(images.toggleCollect).not.toHaveBeenCalled();
        });

        it('calls a method to add image to the basket', function () {
            spyOn(images, 'isAttached').andReturn(false);
            spyOn(images, 'isCollected').andReturn(false);
            scope.thumbnailClicked(123);
            expect(images.toggleCollect).toHaveBeenCalledWith(123);
        });
    });

});
