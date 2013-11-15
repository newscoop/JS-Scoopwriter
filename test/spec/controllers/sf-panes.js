'use strict';

describe('Controller: SfPanesCtrl', function () {

  // load the controller's module
  beforeEach(module('authoringEnvironmentApp'));

  var SfPanesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SfPanesCtrl = $controller('SfPanesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
