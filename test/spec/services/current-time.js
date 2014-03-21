'use strict';

/* this service is really simple, it justs provides the current
 * time. its purpose is to be injected in modules that use the current
 * time, in order to be mocked */

describe('Service: currentTime', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var currentTime;
    beforeEach(inject(function (_currentTime_) {
        currentTime = _currentTime_;
    }));

    it('provides something that ducks like a date', function () {
        var now = currentTime.get();
        expect(typeof now).toBe('object');
        expect('getFullYear' in now);
    });
    describe('once set', function() {
        var preset = new Date('Fri Mar 21 2014 16:02:58 GMT+0100 (CET)');
        beforeEach(function() {
            currentTime.set(preset);
        });
        it('returns our last preset', function() {
            expect(currentTime.get().toJSON())
                .toBe(preset.toJSON());
        });
        it('also has a function useful for formatting dates', function() {
            var test = new Date('Fri Mar 21 2014 10:02:58 GMT+0100 (CET)');
            expect(currentTime.isToday(test)).toBe(true);
            var test = new Date('Fri Mar 20 2014 16:02:58 GMT+0100 (CET)');
            expect(currentTime.isToday(test)).toBe(false);
        });
        describe('once unset', function() {
            beforeEach(function() {
                currentTime.unset();
            });
            it('does not return our last preset anymore', function() {
                expect(currentTime.get().toJSON())
                    .not.toBe(preset.toJSON());
            });
        });
    });

});
