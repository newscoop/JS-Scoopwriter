'use strict';

describe('Controller: EmbedsCtrl', function () {

  // load the controller's module
  beforeEach(module('authoringEnvironmentApp'));

  var EmbedsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EmbedsCtrl = $controller('EmbedsCtrl', {
      $scope: scope
    });
  }));

  it('has three embeds', function () {
    expect(scope.embeds.length).toBe(3);
  });
});
