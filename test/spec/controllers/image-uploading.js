'use strict';

describe('Controller: ImageUploadingCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var ImageUploadingCtrl,
    scope,
    $httpBackend,
    $controller,
    getFileReader = {
        get: function(){
            return {
                readAsBinaryString: function() {
                    this.onload({
                        target: {
                            result: 'string'
                        }
                    });
                }
            };
        }
    };

    beforeEach(inject(function (_$controller_, $rootScope, _$httpBackend_) {
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
    }));
    describe('with one file', function() {
        beforeEach(function () {
            var files = [{
                name: 'file.my'
            }];
            var imageUploading = {
                get: function() {
                    return files;
                }
            };
            $httpBackend.expect(
                'POST',
                rootURI + '/images',
                'image%5Bimage%5D=string'
            ).respond(200, '');
            ImageUploadingCtrl = $controller('ImageUploadingCtrl', {
                $scope: scope,
                imageUploading: imageUploading,
                getFileReader: getFileReader
            });
        });

        it('proxies the singleton', function () {
            expect(scope.imageUploading).toBeDefined();
        });
        it('starts upload on initialization', function() {
            $httpBackend.verifyNoOutstandingRequest();
        });
        it('handles the response', function() {
            $httpBackend.flush();
        });
        describe('on progress', function() {
            beforeEach(function() {
                scope.files[0].progressCallback({
                    loaded: 50,
                    total: 100
                });
            });
            it('updates the model', function() {
                expect(scope.files[0].progress).toBe(50);
                expect(scope.files[0].max).toBe(100);
                expect(scope.files[0].percent).toBe('50%');
            });
        });
    });
});
