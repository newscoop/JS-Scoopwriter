'use strict';

describe('Service: CircularBufferFactory', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var circularBufferFactory, circularBuffer;
    beforeEach(inject(function (_circularBufferFactory_) {
        circularBufferFactory = _circularBufferFactory_;
    }));

    it('should do something', function () {
        expect(!!circularBufferFactory).toBe(true);
    });
    describe('a circular buffer', function(){
        beforeEach(function() {
            circularBuffer = circularBufferFactory.create({
                size: 3
            });
        });
        it('has initial zero size', function() {
            expect(circularBuffer.used()).toBe(0);
        });
        it('tells how much it is used', function() {
            [1, 2].forEach(function(n) {
                circularBuffer.push(n);
            });
            expect(circularBuffer.used()).toBe(2);
        });
        describe('filled after its size', function() {
            beforeEach(function() {
                [1, 2, 3, 4].forEach(function(n) {
                    circularBuffer.push(n);
                });
            });
            it('has a max size', function() {
                expect(circularBuffer.used()).toBe(3);
            });
            it('uses a first in, first out policy', function() {
                expect(circularBuffer.dump())
                    .toEqual([2, 3, 4]);
            });
        });
    });

});
