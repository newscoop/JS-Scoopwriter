'use strict';

/**
* Module with tests for the FormData factory.
*
* @module formDataFactory tests
*/

describe('Service: formDataFactory', function () {

    var fdFactory;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    beforeEach(inject(function (formDataFactory) {
        fdFactory = formDataFactory;
    }));

    it('returns a factory object', function () {
        expect(typeof fdFactory).toEqual('object');
        expect(typeof fdFactory.makeInstance).toEqual('function');
    });

    describe('makeInstance() method', function () {
        it('returns a new FormData instance', function () {
            var fd = new FormData(),
                instance = fdFactory.makeInstance();

            expect(instance).toEqual(fd);
        });
    });

});
