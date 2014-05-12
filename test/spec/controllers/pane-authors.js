'use strict';

/**
* Module with tests for the authors pane controller.
*
* @module PaneAuthorsCtrl controller tests
*/

describe('Controller: PaneAuthorsCtrl', function () {

    beforeEach(module('authoringEnvironmentApp'));

    var PaneAuthorsCtrl,
        scope;

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        PaneAuthorsCtrl = $controller('PaneAuthorsCtrl', {
            $scope: scope
        });
    }));

    // TODO: add tests
});
