'use strict';

describe('Service: AddToUrl', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var addToUrl;
    beforeEach(inject(function (_addToUrl_) {
        addToUrl = _addToUrl_;
    }));

    it('adds parameter to an existing URL without parameters', function () {
        var res = addToUrl.add({par:'val'}, 'www.my.url');
        expect(res).toBe('www.my.url?par=val');
    });
    it('adds parameter to an existing URL with parameters', function () {
        var res = addToUrl.add({par2:'val2'}, 'www.my.url?par=val');
        expect(res).toBe('www.my.url?par=val&par2=val2');
    });
});
