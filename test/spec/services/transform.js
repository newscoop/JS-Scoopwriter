'use strict';

describe('Service: Transform', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var transform;
    beforeEach(inject(function (_transform_) {
        transform = _transform_;
    }));

    it('should do something', function () {
        expect(!!transform).toBe(true);
    });
    it('encodes as a form', function() {
        var data = {i:{am:{a:{simple:'json'}}}};
        var headers = {};
        var headersGetter = function(){ return headers; };
        var result = transform.formEncode(data, headersGetter);
        expect(result).toBe('i%5Bam%5D%5Ba%5D%5Bsimple%5D=json');
        expect(headers).toEqual({ 'Content-Type' : 'application/x-www-form-urlencoded' });
    });
    it('has a simpler interface to be used outside interceptors', function() {
        var data = {i:{am:{a:{simple:'json'}}}};
        var result = transform.formEncodeData(data);
        expect(result).toBe('i%5Bam%5D%5Ba%5D%5Bsimple%5D=json');
    });

});
