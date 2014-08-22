'use strict';

/**
* Module with tests for the mode service.
*
* @module mode service tests
*/
describe('Service: Mode', function () {
    var mode;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    beforeEach(inject(function (_mode_) {
        mode = _mode_;
    }));

    it('mode is set to "normal" by default', function () {
        expect(mode.current).toEqual('normal');
    });

    it('the zen flag is cleared by default', function () {
        expect(mode.zen).toBe(false);
    });

    describe('goZen() method', function () {
        it('changes current mode to "zen"', function () {
            mode.current = 'normal';
            mode.goZen();
            expect(mode.current).toBe('zen');
        });

        it('sets the zen flag"', function () {
            mode.zen = false;
            mode.goZen();
            expect(mode.zen).toBe(true);
        });
    });

    describe('goNormal() method', function() {
        it('changes current mode to "normal"', function () {
            mode.current = 'zen';
            mode.goNormal();
            expect(mode.current).toBe('normal');
        });

        it('clear the zen flag"', function () {
            mode.zen = true;
            mode.goNormal();
            expect(mode.zen).toBe(false);
        });
    });
});
