'use strict';

describe('Controller: ModalCtrl', function () {

  // load the controller's module
  beforeEach(module('authoringEnvironmentApp'));

  var ModalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ModalCtrl = $controller('ModalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a modal to the scope', function () {
    expect(scope.modal).toBeDefined();
  });
});
