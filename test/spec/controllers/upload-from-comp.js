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

    describe('scope\'s addToUploadList method', function () {
        beforeEach(inject(function (_images_) {
            spyOn(images, 'addToUploadList');
        }));

        it('proxies the call to add images to upload list', function () {
            var newImages = [{}, {}, {}];
            scope.addToUploadList(newImages);
            expect(images.addToUploadList).toHaveBeenCalledWith([{}, {}, {}]);
        });
    });

    describe('scope\'s removeFromStaging method', function () {
        beforeEach(inject(function (_images_) {
            spyOn(images, 'removeFromUploadList');
        }));

        it('proxies the call to remove image from upload list', function () {
            scope.removeFromStaging();
            expect(images.removeFromUploadList).toHaveBeenCalled();
        });
    });

    describe('scope\'s uploadStaged method', function () {
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

    });

    describe('scope\'s clearStaged method', function () {
        it('clears the images2upload list by using the images service',
            function () {
                spyOn(images, 'clearUploadList');
                scope.clearStaged();
                expect(images.clearUploadList).toHaveBeenCalled();
        });
    });

});
