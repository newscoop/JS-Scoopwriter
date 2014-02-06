'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('authoringEnvironmentApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
      $httpBackend
          .expectGET('http://tw-merge.lab.sourcefabric.org/oauth/v2/token?client_id=1_2gkjgb9tl0sgwow8w4ksg4ws4wkw8884c848kwgkw4k8gc4woc&client_secret=60mtm1heov8kwskss8gcg0cokwckkkk0cowocos4swc4g80s80&grant_type=client_credentials')
          .respond({});
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('exists', function () {
    expect(MainCtrl).toBeDefined();
  });
});
