'use strict';

describe('Controller: FixedImagePlaceholderCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var FixedImagePlaceholderCtrl,
    scope,
    images = {
        byId: function() {
            return {
                basename: 'mocked.jpg'
            }
        }
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        FixedImagePlaceholderCtrl = $controller('FixedImagePlaceholderCtrl', {
            $scope: scope,
            images: images
        });
    }));

    it('hides the dropped image at the beginning', function () {
        expect(scope.style.opacity).toBe(0);
    });
    describe('dropped image', function() {
        beforeEach(function() {
            spyOn(images, 'byId').andCallThrough();
            scope.onDrop(
                '{"id":"3","width":"100%","type":"image"}'
            );
        });
        it('shows the dropped image', function() {
            expect(scope.style.opacity).toBe(1);
        });
        it('fetches image details', function() {
            expect(images.byId).toHaveBeenCalledWith('3');
        });
        it('updates the source', function() {
            expect(scope.image.basename).toBe('mocked.jpg');
        });
    });
});
