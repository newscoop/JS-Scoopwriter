'use strict';

describe('Controller: DroppedImageCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var DroppedImageCtrl,
    scope,
    image;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        image = {
            style: {
                container: {},
                image: {}
            },
            basename: '/test.jpg',
        };
        var images = {
            selected: 3,
            included: {
                3: image
            },
            include: function() { return 3; },
            byId: function(id) {
                return {
                    basename: '/test-2.jpg',
                };
            }
        };
        DroppedImageCtrl = $controller('DroppedImageCtrl', {
            $scope: scope,
            images: images,
            configuration: {image:{width:{
                small: '20%'
            }}}
        });
    }));

    it('proxies images', function () {
        expect(scope.images).toBeDefined();
    });
    it('sets size', function() {
        scope.size('small');
        expect(image.style.container.width)
            .toBe('20%');
    });
    describe('image got', function() {
        beforeEach(function() {
            scope.get(3);
        });
        it('adds the image in the scope', function() {
            expect(scope.style).toBeDefined();
        });
    });
});
