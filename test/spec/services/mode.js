'use strict';

describe('Service: Mode', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var mode;
    beforeEach(inject(function (_mode_) {
        mode = _mode_;
    }));

    it('is not zen', function () {
        expect(mode.zen).toBe(false);
    });
    describe('enter zen mode', function() {
        beforeEach(function() {
            mode.goZen();
        });
        it('is very zen now', function() {
            expect(mode.zen).toBe(true);
        });
    });
});
