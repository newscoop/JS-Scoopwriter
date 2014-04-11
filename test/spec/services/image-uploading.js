'use strict';

describe('Service: ImageUploading', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var imageUploading;
    beforeEach(inject(function (_imageUploading_) {
        imageUploading = _imageUploading_;
    }));

    describe('FileList got', function() {
        beforeEach(function() {
            var fileList = {
                length: 3,
                item: function(i) {
                    switch(i) {
                        case 0:
                        return 'a';
                        break;
                        case 1:
                        return 'b';
                        break;
                        case 2:
                        return 'c';
                        break;
                    }
                }
            };
            imageUploading.init(fileList);
        });
        it('converts it to an array of files', function () {
            var identity = function(file) { return file; };
            expect(imageUploading.get().map(identity))
                .toEqual(['a', 'b', 'c']);
        });
    });

});
