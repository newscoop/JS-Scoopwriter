'use strict';

describe('Controller: AuthenticationCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var AuthenticationCtrl,
    $scope,
    $window = {
        sessionStorage: {}
    },
    $location = {
        url: function(){ return '/access_token=whatever&other=parameters'; },
        hash: function() { return ''; }
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        $scope = $rootScope.$new();
        AuthenticationCtrl = $controller('AuthenticationCtrl', {
            $scope: $scope,
            $window: $window,
            $location: $location
        });
    }));

    it('parses the fragment', function () {
        var fragment = '/access_token=whatever&other=parameters';
        expect($scope.parse(fragment)).toEqual({
            access_token: 'whatever',
            other: 'parameters'
        });
    });
    it('gets the token from the location and puts it in the session storage', function() {
        expect($window.sessionStorage.token).toBe('whatever');
    });
});
