'use strict';

describe('Service: Configuration', function () {

    var configuration;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    beforeEach(inject(function (_configuration_) {
        configuration = _configuration_;
    }));

    it('defines widths', function () {
        expect(configuration.image.width.small).toBeDefined();
        expect(configuration.image.width.medium).toBeDefined();
        expect(configuration.image.width.big).toBeDefined();
    });

    it('defines article type fields', function () {
        expect(configuration.articleTypeFields).toBeDefined();
        expect(configuration.articleTypeFields.news).toBeDefined();
        expect(configuration.articleTypeFields.newswire).toBeDefined();
        expect(configuration.articleTypeFields.blog).toBeDefined();
    });
});
