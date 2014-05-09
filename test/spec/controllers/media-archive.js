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

    it('sets searchFilter to empty string by default', function () {
        expect(scope.searchFilter).toEqual('');
    });

    it('updates scope\'s appliedFilter property on changes in images service',
        inject(function (images) {
            scope.appliedFilter = 'foo';

            images.searchFilter = 'bar';
            scope.$apply();

            expect(scope.appliedFilter).toEqual('bar');
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

    describe('scope\'s searchArchive() method', function () {
        it('delegates search action to images service', inject(
            function (images) {
                spyOn(images, 'query');
                scope.searchArchive('flower');
                expect(images.query).toHaveBeenCalledWith('flower');
            }
        ));
    });

    describe('scope\'s loadMore() method', function () {
        it('delegates loading more images action to images service', inject(
            function (images) {
                spyOn(images, 'more');
                scope.loadMore();
                expect(images.more).toHaveBeenCalled();
            }
        ));
    });

});
