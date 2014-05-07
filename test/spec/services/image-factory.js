'use strict';

/**
* Module with tests for the Image factory.
*
* @module imageFactory tests
*/

describe('Service: imageFactory', function () {

    var imgFactory;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    beforeEach(inject(function (imageFactory) {
        imgFactory = imageFactory;
    }));

    it('returns a factory object', function () {
        expect(typeof imgFactory).toEqual('object');
        expect(typeof imgFactory.makeInstance).toEqual('function');
    });

    describe('makeInstance() method', function () {
        it('returns a new Image instance', function () {
            var diff,
                imgKeys,
                instanceKeys,
                img = new Image(),
                instance = imgFactory.makeInstance();

            expect(typeof instance).toEqual('object');

            imgKeys = Object.keys(img);
            instanceKeys = Object.keys(instance);

            // we can't directly compare instance == img, thus we check if
            // both objects' keys are the same, making it highly likely
            // that instance is indeed an instance of Image
            expect(instanceKeys.length).toEqual(imgKeys.length);

            // instanceKeys should contain all keys in imgKeys
            diff = _.difference(imgKeys, instanceKeys);
            expect(diff.length).toEqual(0);

            // instanceKeys should not contain any keys not in imgKeys
            diff = _.difference(instanceKeys, imgKeys);
            expect(diff.length).toEqual(0);
        });
    });

});
