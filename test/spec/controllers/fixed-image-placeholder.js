'use strict';

/**
* Module with tests for the FixedImagePlaceholderCtrl controller.
*
* @module FixedImagePlaceholderCtrl tests
*/

describe('Controller: FixedImagePlaceholderCtrl', function () {
    var FixedImagePlaceholderCtrl,
        scope,
        imagesService;

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        imagesService =  {
            byId: function () {}
        };

        FixedImagePlaceholderCtrl = $controller('FixedImagePlaceholderCtrl', {
            $scope: scope,
            images: imagesService
        });
    }));

    it('initializes the dropped flag in scope to false', function () {
        expect(scope.dropped).toBe(false);
    });

    it('defines no special styling in scope by default', function () {
        expect(scope.style).toEqual({});
    });

    describe('scope\'s onDrop() method', function () {
        beforeEach(function () {
            spyOn(imagesService, 'byId');
        });

        it('makes the dropped image opaque', function () {
            scope.onDrop(
                JSON.stringify({id: 3, width: '100%', type: 'image'})
            );
            expect(scope.style.opacity).toEqual(1);
        });

        it('fetches image details from the images service', function () {
            scope.onDrop(
                JSON.stringify({id: 3, width: '100%', type: 'image'})
            );
            expect(imagesService.byId).toHaveBeenCalledWith(3);
        });

        it('exposes retrieved image object in scope', function () {
            var image = {id: 3, basename: 'mock.jpg'};
            imagesService.byId.andReturn(image);

            scope.onDrop(
                JSON.stringify({id: 3, width: '100%', type: 'image'})
            );
            expect(scope.image).toEqual(image);
        });

        it('sets the dropped flag in scope', function () {
            scope.onDrop(
                JSON.stringify({id: 3, width: '100%', type: 'image'})
            );
            expect(scope.dropped).toBe(true);
        });

        it('sets the dropped flag in scope', function () {
            scope.onDrop(
                JSON.stringify({id: 3, width: '100%', type: 'image'})
            );
            expect(scope.dropped).toBe(true);
        });

        it('does not do anything for unknown types', function () {
            scope.image = undefined;
            scope.style = {};
            scope.dropped = false;

            scope.onDrop(
                JSON.stringify({id: 3, width: '100%', type: 'unknown'})
            );

            expect(imagesService.byId).not.toHaveBeenCalled();
            expect(scope.image).toBeUndefined();
            expect(scope.style).toEqual({});
            expect(scope.dropped).toBe(false);
        });
    });
});
