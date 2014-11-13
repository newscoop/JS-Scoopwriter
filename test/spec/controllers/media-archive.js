'use strict';

/**
* Module with tests for the media archive controller.
*
* @module MediaArchiveCtrl controller tests
*/

describe('Controller: MediaArchiveCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var fakeImagesService,
        MediaArchiveCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        fakeImagesService = {};
        scope = $rootScope.$new();

        MediaArchiveCtrl = $controller('MediaArchiveCtrl', {
            $scope: scope,
            images: fakeImagesService
        });
    }));

    it('sets searchFilter to empty string by default', function () {
        expect(scope.searchFilter).toEqual('');
    });

    it('updates scope\'s appliedFilter property on changes in images service',
        function () {
            scope.appliedFilter = 'foo';
            fakeImagesService.searchFilter = 'bar';
            scope.$digest();
            expect(scope.appliedFilter).toEqual('bar');
    });

    it('exposes imagesservice in scope', function () {
        expect(scope.images).toBe(fakeImagesService);
    });

    it('sets `root` property on scope holding API root URL', function () {
        expect(scope.root).toEqual('http://newscoop.aes.sourcefabric.net');
    });

    describe('scope\'s thumbnailClicked() method', function () {
        beforeEach(function () {
            fakeImagesService.toggleCollect = jasmine.createSpy();
            fakeImagesService.isAttached = jasmine.createSpy();
            fakeImagesService.isCollected = jasmine.createSpy();
        });

        it('does nothing if clicked image is already attached', function () {
            fakeImagesService.isAttached.andReturn(true);
            fakeImagesService.isCollected.andReturn(false);
            scope.thumbnailClicked(123);
            expect(fakeImagesService.toggleCollect).not.toHaveBeenCalled();
        });

        it('does nothing if clicked image is in the basket', function () {
            fakeImagesService.isAttached.andReturn(false);
            fakeImagesService.isCollected.andReturn(true);
            scope.thumbnailClicked(123);
            expect(fakeImagesService.toggleCollect).not.toHaveBeenCalled();
        });

        it('calls a method to add image to the basket', function () {
            fakeImagesService.isAttached.andReturn(false);
            fakeImagesService.isCollected.andReturn(false);
            scope.thumbnailClicked(123);
            expect(fakeImagesService.toggleCollect).toHaveBeenCalledWith(123);
        });
    });

    describe('scope\'s searchArchive() method', function () {
        it('delegates search action to images service', function () {
            fakeImagesService.query = jasmine.createSpy();
            scope.searchArchive('flower');
            expect(fakeImagesService.query).toHaveBeenCalledWith('flower');
        });
    });

    describe('scope\'s loadMore() method', function () {
        it('delegates loading more images action to images service',
            function () {
                fakeImagesService.more = jasmine.createSpy();
                scope.loadMore();
                expect(fakeImagesService.more).toHaveBeenCalled();
            }
        );
    });

});
