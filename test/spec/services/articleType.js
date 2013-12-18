'use strict';

describe('Service: Articletype', function () {

  // load the service's module
  beforeEach(module('authoringEnvironmentApp'));

  // instantiate service
  var Articletype;
  beforeEach(inject(function (_Articletype_) {
    Articletype = _Articletype_;
  }));

  it('should do something', function () {
    expect(!!Articletype).toBe(true);
  });

});
