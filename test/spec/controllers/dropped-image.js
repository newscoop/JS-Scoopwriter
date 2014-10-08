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
            inArticleBody: {},
            attached: [],
            byId: function () {}
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

    it('exposes images service in scope', function () {
        expect(scope.images).toBe(images);
    });

    it('exposes base URL in scope', inject(function (configuration) {
        expect(scope.root).toEqual(configuration.API.rootURI);
    }));

    it('sets scope\'s editingCaption flag to false by default', function () {
        expect(scope.editingCaption).toBe(false);
    });

    it('sets new image caption auxiliary variable in scope to an empty ' +
       'string by default',
        function () {
            expect(scope.newCaption).toEqual('');
        }
    );

    describe('init() method', function () {
        var deferredAttached,
            mockedImage;

        beforeEach(inject(function ($q) {
            mockedImage = {
                id: 5,
                description: 'My image'
            };
            spyOn(images, 'byId').andReturn(mockedImage);

            deferredAttached = $q.defer();
            images.attached.$promise = deferredAttached.promise;
        }));

        it('exposes correct image object in scope', function () {
            scope.image = null;

            DroppedImageCtrl.init(5);
            deferredAttached.resolve();
            scope.$digest();

            expect(scope.image).toBe(mockedImage);  // test for identity!
        });

        it('adds image to the list of images in article body', function () {
            DroppedImageCtrl.init(5);
            deferredAttached.resolve();
            scope.$digest();

            expect(images.addToIncluded).toHaveBeenCalledWith(5);
        });

        it('sets the new image caption auxiliary variable to image ' +
            'description',
            function () {
                scope.newCaption = '';

                DroppedImageCtrl.init(5);
                deferredAttached.resolve();
                scope.$digest();

                expect(scope.newCaption).toEqual('My image');
            }
        );

        it('resolves given promise with correct image object', function () {
            var onSuccessSpy = jasmine.createSpy(),
                promise;

            promise = DroppedImageCtrl.init(5);
            promise.then(onSuccessSpy);

            deferredAttached.resolve();
            scope.$digest();

            expect(onSuccessSpy).toHaveBeenCalledWith(mockedImage);
        });
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

    describe('scope\'s editCaptionMode() method', function () {
        beforeEach(function () {
            scope.image = {description: 'my image'};
        });

        it('sets the editingCaption flag on request', function () {
            scope.editingCaption = false;
            scope.editCaptionMode(true);
            expect(scope.editingCaption).toBe(true);
        });

        it('clears the editingCaption flag on request', function () {
            scope.editingCaption = true;
            scope.editCaptionMode(false);
            expect(scope.editingCaption).toBe(false);
        });

        it('sets the newCaption variable to image\'s description when ' +
            'enabling the edit caption mode',
            function () {
                scope.newCaption = 'foo';
                scope.editCaptionMode(true);
                expect(scope.newCaption).toEqual('my image');
            }
        );
    });

    describe('scope\'s updateCaption() method', function () {
        var deferredUpdate;

        beforeEach(inject(function ($q) {
            scope.image = {
                description: 'Image foo',
                updateDescription: function () {}
            };

            deferredUpdate = $q.defer();
            spyOn(scope.image, 'updateDescription').andCallFake(function () {
                return deferredUpdate.promise;
            });
        }));

        it('clears the editingCaption flag', function () {
            scope.editingCaption = true;
            scope.updateCaption();
            expect(scope.editingCaption).toBe(false);
        });

        it('reverts new image caption auxiliary variable back to original ' +
            'image description on server error',
            function () {
                scope.image.description = 'Image foo';
                scope.newCaption = 'Image new foo';

                scope.updateCaption();
                deferredUpdate.reject('Server timeout');
                scope.$digest();

                expect(scope.newCaption).toEqual('Image foo');
        });
    });
});
