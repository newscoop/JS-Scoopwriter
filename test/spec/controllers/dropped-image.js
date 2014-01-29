'use strict';

describe('Controller: DroppedImageCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var DroppedImageCtrl,
    scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        var images = {
            byId: function(id) {
                return {
                    success: function(f) {
                        f({
                            basename: '/test.jpg',
                        });
                    }
                }
            }
        };
        DroppedImageCtrl = $controller('DroppedImageCtrl', {
            $scope: scope,
            images: images
        });
    }));

    it('proxies images', function () {
        expect(scope.images).toBeDefined();
    });
});
