'use strict';

/**
* Module with tests for the platform service.
*
* @module platform service tests
*/
describe('Service: Platform', function () {
    var platform;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    beforeEach(inject(function (_platform_) {
        platform = _platform_;
    }));

    it('current platform is set to "desktop" by default', function () {
        expect(platform.current).toEqual('desktop');
    });

    describe('the go object\'s mobile() method', function () {
        it('sets current mode to "mobile"', function () {
            platform.current = 'desktop';
            platform.go.mobile();
            expect(platform.current).toEqual('mobile');
        });
    });

    describe('the go object\'s desktop() method', function () {
        it('sets current mode to "desktop"', function () {
            platform.current = 'tablet';
            platform.go.desktop();
            expect(platform.current).toEqual('desktop');
        });
    });

    describe('the go object\'s tablet() method', function () {
        it('sets current mode to "tablet"', function () {
            platform.current = 'desktop';
            platform.go.tablet();
            expect(platform.current).toEqual('tablet');
        });
    });
});
