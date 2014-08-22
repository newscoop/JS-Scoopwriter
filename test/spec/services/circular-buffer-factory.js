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

    it('rases an error if "size" option is not given', function () {
        expect(function () {
            circularBufferFactory.create({foo: 42});
        }).toThrow('a circular buffer needs an integer size option');
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
            it('gives the previous element', function() {
                expect(circularBuffer.prev()).toBe(4);
            });
            it('gives the previous element', function() {
                expect(circularBuffer.prev(1)).toBe(4);
            });
            it('gives the element before the previous', function() {
                expect(circularBuffer.prev(2)).toBe(3);
            });
            it('gives the first element', function() {
                expect(circularBuffer.prev(3)).toBe(2);
            });
            it('gives the first element if looking too far behind', function() {
                expect(circularBuffer.prev(100)).toBe(2);
            });
            it('throws an exception if negative values are used', function() {
                expect(function() {
                    circularBuffer.prev(-100);
                }).toThrow();
            });
        });
    });

});
