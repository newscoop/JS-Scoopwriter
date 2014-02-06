'use strict';

describe('Service: AuthInterceptor', function () {

  // load the service's module
  beforeEach(module('authoringEnvironmentApp'));

  // instantiate service
  var AuthInterceptor;
  beforeEach(inject(function (_authInterceptor_) {
    AuthInterceptor = _authInterceptor_;
  }));

  it('should do something', function () {
    expect(!!AuthInterceptor).toBe(true);
  });

});
