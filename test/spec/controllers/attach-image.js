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
        images,
        modal,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, _images_, _modal_) {
        scope = $rootScope.$new();
        images = _images_;
        modal = _modal_;

        AttachImageCtrl = $controller('AttachImageCtrl', {
            $scope: scope
        });
    }));

    it('sets API root URL in scope', function () {
        expect(scope.root).toEqual('http://newscoop.aes.sourcefabric.net');
    });

    it('proxies images', function () {
        expect(scope.images).toBeDefined();
    });

    it('has the "archive" source selected by default', function () {
        expect(scope.selected).toEqual({
            value : 'archive',
            url : 'views/attach-image/archive.html',
            description : 'From Media Archive'
        });
    });

    describe('scope\'s select method', function () {
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

    describe('scope\'s uploadImages method', function () {
        beforeEach(function () {
            spyOn(images, 'uploadAll');
        });

        it('triggers image uploading', function () {
            images.uploadAll.andReturn([]);  // empty promise list
            scope.uploadImages();
            expect(images.uploadAll).toHaveBeenCalled();
        });

        describe('after successful upload', function () {
            var deferred,
                deferred2;

            beforeEach(inject(function (_$q_) {
                var uploadPromise,
                    uploadPromise2

                deferred = _$q_.defer();
                deferred2 = _$q_.defer();
                uploadPromise = deferred.promise;
                uploadPromise2 = deferred2.promise;

                images.uploadAll.andReturn([uploadPromise, uploadPromise2]);
                spyOn(images, 'attachAllUploaded');
                spyOn(modal, 'hide');
            }));

            it('triggers attaching images to article', function () {
                scope.uploadImages();

                deferred.resolve();
                deferred2.resolve();
                scope.$apply();

                expect(images.attachAllUploaded).toHaveBeenCalled();
            });

            it('clears images2upload list', function () {
                images.images2upload = [{}, {}, {}];
                scope.uploadImages();
                expect(images.images2upload.length).toEqual(3);

                deferred.resolve();
                deferred2.resolve();
                scope.$apply();

                expect(images.images2upload.length).toEqual(0);
            });

            it('closes the modal', function () {
                scope.uploadImages();

                deferred.resolve();
                deferred2.resolve();
                scope.$apply();

                expect(modal.hide).toHaveBeenCalled();
            });
        });
    });

    describe('scope\'s discardChanges method', function () {
        var eventObj;

        beforeEach(function () {
            spyOn(images, 'discardAll');
            spyOn(modal, 'hide');
            eventObj = {
                preventDefault: function () {},
                stopPropagation: function () {}
            };
        });

        it('triggers discarding all the changes', function () {
            scope.discardChanges(eventObj);
            expect(images.discardAll).toHaveBeenCalled();
        });

        it('closes the modal', function () {
            scope.discardChanges(eventObj);
            expect(modal.hide).toHaveBeenCalled();
        });
    });

});
