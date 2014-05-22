'use strict';

/**
* Module with tests for the Date factory.
*
* @module dateFactory tests
*/

describe('Service: dateFactory', function () {

    var factory;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    beforeEach(inject(function (dateFactory) {
        factory = dateFactory;
    }));

    it('returns a factory object', function () {
        expect(typeof factory).toEqual('object');
        expect(typeof factory.makeInstance).toEqual('function');
    });

    describe('makeInstance() method', function () {
        it('returns a new Date instance', function () {
            var instance = factory.makeInstance();
            expect(instance instanceof Date).toEqual(true);
        });
    });

});
