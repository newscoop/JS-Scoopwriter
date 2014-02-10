'use strict';

describe('Controller: MainCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var MainCtrl,
    $scope,
    $window = {
        sessionStorage: {},
        location: {}
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
        $httpBackend
            .expectGET('http://tw-merge.lab.sourcefabric.org/oauth/v2/token?client_id=1_2gkjgb9tl0sgwow8w4ksg4ws4wkw8884c848kwgkw4k8gc4woc&client_secret=60mtm1heov8kwskss8gcg0cokwckkkk0cowocos4swc4g80s80&grant_type=client_credentials')
            .respond({});
        $scope = $rootScope.$new();
        MainCtrl = $controller('MainCtrl', {
            $scope: $scope,
            $window: $window
        });
    }));

    it('exists', function () {
        expect(MainCtrl).toBeDefined();
    });
    it('redirects the user at the beginning because the token is not there', function() {
        expect($window.location.href).toBe('http://tw-merge.lab.sourcefabric.org/oauth/v2/auth?client_id=3_uutz7mlvof4kc4wckcgcs4wg8oosgwg8gg4cg0wkkk0cc0w0k&redirect_uri=http%3A%2F%2Flocalhost:9000&response_type=token');
    });
});
