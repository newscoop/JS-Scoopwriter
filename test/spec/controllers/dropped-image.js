'use strict';

describe('Controller: DroppedImageCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var DroppedImageCtrl,
        NcImage,
        scope,
        $log,
        image = {
            basename: '/test.jpg',
        },
        images = {
            addToIncluded: jasmine.createSpy(),
            removeFromIncluded: jasmine.createSpy(),
            inArticleBody: {}
        };

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, _NcImage_, _$log_) {
        NcImage = _NcImage_;
        scope = $rootScope.$new();
        DroppedImageCtrl = $controller('DroppedImageCtrl', {
            $scope: scope,
            images: images
        });
    }));

    describe('init() method', function () {
        var deferredGet;

        beforeEach(inject(function ($q) {
            deferredGet = $q.defer();
            spyOn(NcImage, 'getById').andCallFake(function () {
                return deferredGet.promise;
            });
        }));

        it('tries to retrieve the right image', function () {
            DroppedImageCtrl.init(5);
            expect(NcImage.getById).toHaveBeenCalledWith(5);
        });

        it('initializes the image object in scope', function () {
            scope.image = null;

            DroppedImageCtrl.init(5);
            deferredGet.resolve({id: 5, basename: 'foo.jpg'});
            scope.$apply();

            expect(scope.image).toEqual({id: 5, basename: 'foo.jpg'});
        });

        it('adds ID of the retrieved image to the list of images ' +
            'in article body',
            function () {
                DroppedImageCtrl.init(5);
                deferredGet.resolve({id: 5, basename: 'foo.jpg'});
                scope.$apply();

                expect(images.addToIncluded).toHaveBeenCalledWith(5);
            }
        );
    });

    describe('imageRemoved() method', function () {
        it('removes ID of the deleted image from the list of images ' +
            'in article body',
            function () {
                DroppedImageCtrl.imageRemoved(5);
                expect(images.removeFromIncluded).toHaveBeenCalledWith(5);
            }
        );
    });

    it('proxies images', function () {
        expect(scope.images).toBeDefined();
    });
});
