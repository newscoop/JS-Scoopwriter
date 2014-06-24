'use strict';

/**
* Module with tests for the upload from computer controller.
*
* @module UploadFromCompCtrl controller tests
*/

describe('Controller: UploadFromCompCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var UploadFromCompCtrl,
        images,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, _images_) {
        scope = $rootScope.$new();
        images = _images_;

        UploadFromCompCtrl = $controller('UploadFromCompCtrl', {
            $scope: scope
        });
    }));

    it('proxies images2upload collection', function () {
        expect(scope.images2upload).toBeDefined();
    });

    it('initializes uploading flag in scope to false', function () {
        expect(scope.uploading).toBe(false);
    });

    describe('scope\'s addToUploadList() method', function () {
        beforeEach(inject(function (_images_) {
            spyOn(images, 'addToUploadList');
        }));

        it('proxies the call to add images to upload list', function () {
            var newImages = [{}, {}, {}];
            scope.addToUploadList(newImages);
            expect(images.addToUploadList).toHaveBeenCalledWith([{}, {}, {}]);
        });
    });

    describe('scope\'s removeFromStaging() method', function () {
        beforeEach(inject(function (_images_) {
            spyOn(images, 'removeFromUploadList');
        }));

        it('proxies the call to remove image from upload list', function () {
            scope.removeFromStaging();
            expect(images.removeFromUploadList).toHaveBeenCalled();
        });
    });

    describe('scope\'s uploadStaged() method', function () {
        var deferred,
            deferred2;

        beforeEach(inject(function (_images_, $q) {
            deferred = $q.defer();
            deferred2 = $q.defer();

            spyOn(images, 'uploadAll').andCallFake(function () {
                return [deferred.promise, deferred2.promise];
            });
            spyOn(images, 'collect');
            spyOn(images, 'clearUploadList');
        }));

        it('sets uploading flag before doing anything', function () {
            scope.uploading = false;
            scope.uploadStaged();
            expect(scope.uploading).toBe(true);
        });

        it('invokes uploadAll() method of the images service', function () {
            scope.uploadStaged();
            expect(images.uploadAll).toHaveBeenCalled();
        });

        it('adds all uploaded images to basket', function () {
            scope.uploadStaged();
            deferred.resolve({id:4});
            deferred2.resolve({id:17});
            scope.$apply();

            expect(images.collect).toHaveBeenCalledWith(4, true);
            expect(images.collect).toHaveBeenCalledWith(17, true);
        });

        it('clears the images2upload list after successful uploading',
            function () {
                scope.uploadStaged();
                deferred.resolve({id:4});
                deferred2.resolve({id:17});
                scope.$apply();

                expect(images.clearUploadList).toHaveBeenCalled();
        });

        it('clears uploading flag after a successful upload', function () {
            scope.uploadStaged();
            scope.uploading = true;

            deferred.resolve({id:4});
            deferred2.resolve({id:17});
            scope.$apply();

            expect(scope.uploading).toBe(false);
        });

        it('clears uploading flag after a failed upload', function () {
            scope.uploadStaged();
            scope.uploading = true;

            deferred.resolve({id:4});
            deferred2.reject();  // this upload fails
            scope.$apply();

            expect(scope.uploading).toBe(false);
        });
    });

    describe('scope\'s clearStaged() method', function () {
        it('clears the images2upload list by using the images service',
            function () {
                spyOn(images, 'clearUploadList');
                scope.clearStaged();
                expect(images.clearUploadList).toHaveBeenCalled();
        });
    });

    describe('scope\'s setForAllPhotographer() method', function () {
        it('sets given photographer name for all images in images2upload list',
            function () {
                images.images2upload = [
                    {photographer: 'name 1'},
                    {photographer: 'name 2'},
                    {photographer: 'name 3'},
                ];
                scope.setForAllPhotographer('John Doe');

                images.images2upload.forEach(function (item) {
                    expect(item.photographer).toEqual('John Doe');
            });
        });
    });

    describe('scope\'s setForAllDescription() method', function () {
        it('sets given image description for all images in images2upload list',
            function () {
                images.images2upload = [
                    {description: 'description 1'},
                    {description: 'description 2'},
                    {description: 'description 3'},
                ];
                scope.setForAllDescription('A lovely picture!');

                images.images2upload.forEach(function (item) {
                    expect(item.description).toEqual('A lovely picture!');
            });
        });
    });
});
