'use strict';

describe('Service: ImageResource', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var imageResource, $httpBackend;
    beforeEach(inject(function (_imageResource_, _$httpBackend_) {
        imageResource = _imageResource_;
        $httpBackend = _$httpBackend_;
    }));

    xit('creates an image', function () {
        // This will be handled by ng-file-upload
        var success = jasmine.createSpy('success'),
            url;

        url = Routing.generate('newscoop_gimme_images_createimage', {}, true);

        $httpBackend.expect('POST', url, 'image[image]=what').respond(200, '');
        imageResource.create({}, {image:{image:'what'}}, success);
        $httpBackend.flush();
        expect(success).toHaveBeenCalled();
    });
    it('sets an image parameter', function () {
        var success = jasmine.createSpy('success'),
            url;

        url = Routing.generate(
            'newscoop_gimme_images_updateimage', {number: 64}, true
        );

        $httpBackend.expect(
            'PATCH',
            url,
            'image%5Bdescription%5D=desc'
        ).respond(200, '');

        imageResource.modify({id:64}, {image:{description:'desc'}}, success);
        $httpBackend.flush();
        expect(success).toHaveBeenCalled();
    });
    it('removes an image', function() {
        var success = jasmine.createSpy('success'),
            url;

        url = Routing.generate(
            'newscoop_gimme_images_deleteimage', {number: 64}, true
        );

        $httpBackend.expect('DELETE', url).respond(200, '');

        imageResource.delete({id:64}, success);
        $httpBackend.flush();
        expect(success).toHaveBeenCalled();
    });

});
