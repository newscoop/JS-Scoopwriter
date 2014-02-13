'use strict';

describe('Service: Platform', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var platform;
    beforeEach(inject(function (_platform_) {
        platform = _platform_;
    }));

    it('is initially desktop', function () {
        expect(platform.current).toBe('desktop');
    });
    describe('gone mobile', function() {
        beforeEach(function() {
            platform.go.mobile();
        });
        it('is mobile', function() {
            expect(platform.current).toBe('mobile');
        });
    });
});
