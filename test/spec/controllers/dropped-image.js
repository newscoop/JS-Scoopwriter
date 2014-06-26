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
        selected: null,
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

        it('tries to retrieve correct image', function () {
            scope.image = null;

            DroppedImageCtrl.init(5);
            deferredGet.resolve({id: 5, basename: 'foo.jpg'});
            scope.$apply();

            expect(scope.image).toEqual({id: 5, basename: 'foo.jpg'});
        });
    });

    it('proxies images', function () {
        expect(scope.images).toBeDefined();
    });
    describe('image got', function() {
        beforeEach(function() {
            scope.get(3);
            image.style = {
                container: {},
                image: {}
            };
        });
        describe('image selected', function() {
            beforeEach(function() {
                scope.select(3);
            });
            it('sets the image as selected in the service', function() {
                expect(images.selected).toBe(3);
            });
            /* the pitfall about many of the following settings is
             * having them correcly set after several changes. for
             * example changing the width to full screen may affect
             * the margin, the positioning, etcetera. add more
             * specific tests when you are in doubt. this is also why
             * the whole style is checked in each test */
            it('sets a big size', function() {
                scope.size('big');
                expect(images.included[3].style)
                    .toEqual({ container : { width : '100%', margin : '0' }, image : {  } });
            });
            it('aligns a big image to the right', function() {
                scope.size('big');
                scope.align('right');
                expect(images.included[3].style)
                    .toEqual({ container : { width : '100%', margin : undefined, float : 'right' }, image : {  } });
            });
            it('sets original size', function() {
                scope.size('original');
                expect(images.included[3].style)
                    .toEqual({ container : { width : 'auto' }, image : { width : 'auto' } });
            });
            it('sets another size', function() {
                scope.size('whatever');
                expect(images.included[3].style)
                    .toEqual({ container : { width : undefined }, image : {  } });
            });
            it('sets a size in pixels', function() {
                scope.pixels = 200;
                scope.pixelsChanged();
                expect(images.included[3].style)
                    .toEqual({ container : {  }, image : { width : '200px' } });
            });
            it('aligns left', function() {
                scope.align('left');
                expect(images.included[3].style)
                    .toEqual({ container : { float : 'left', margin : '0 2% 0 0' }, image: {}});
            });
            it('aligns right', function() {
                scope.align('right');
                expect(images.included[3].style)
                    .toEqual({ container : { float : 'right', margin : '0 0 0 2%' }, image: {}});
            });
            it('aligns center', function() {
                scope.align('center');
                expect(images.included[3].style)
                    .toEqual({ container : { float : 'none', margin : '0 auto' }, image : {  } });
            });
            describe('somebody changes the selected image', function() {
                beforeEach(function() {
                    images.selected = 4;
                });
                it('cannot change the size of a wrong image', function() {
                    expect(function() {
                        scope.size('big');
                    }).toThrow();
                });
            });
        });
    });
});
