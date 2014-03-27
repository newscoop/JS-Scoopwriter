'use strict';

describe('Service: FileReader', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var getFileReader;
    beforeEach(inject(function (_getFileReader_) {
        getFileReader = _getFileReader_;
    }));

    it('should do something', function () {
        expect(!!getFileReader).toBe(true);
    });

});
