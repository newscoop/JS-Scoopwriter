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

});
