'use strict';

describe('Controller: MainCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var MainCtrl,
        userAuth,
        toaster,
        deferredObtainToken,
        deferredNewToken,
        deferredToaster,
        $scope,
        $window = {
            sessionStorage: {},
            location: {}
        };
    beforeEach(inject(function ($q, $controller, $rootScope, _toaster_) {
        deferredObtainToken = $q.defer();
        deferredNewToken = $q.defer();
        deferredToaster = $q.defer();
        toaster = _toaster_;
        userAuth = {
            isAuthenticated: function () {
              return false;
            },
            obtainToken: function () {
                return deferredObtainToken.promise;
            },
            newTokenByLoginModal: function () {
                return deferredNewToken.promise;
            }
        }
        spyOn(toaster, 'add').andCallFake(function () {
            return deferredToaster.promise;
        });
        $scope = $rootScope.$new();
        MainCtrl = $controller('MainCtrl', {
            $scope: $scope,
            $window: $window,
            userAuth: userAuth,
            toaster: toaster
        });
        $scope.$broadcast('$viewContentLoaded');
    }));

    it('exists', inject(function ($controller, $rootScope, $httpBackend) {
        $httpBackend
            .expectGET('http://newscoop.aes.sourcefabric.net/oauth/v2/token?client_id=1_2gkjgb9tl0sgwow8w4ksg4ws4wkw8884c848kwgkw4k8gc4woc&client_secret=60mtm1heov8kwskss8gcg0cokwckkkk0cowocos4swc4g80s80&grant_type=client_credentials')
            .respond({});
        $scope = $rootScope.$new();
        MainCtrl = $controller('MainCtrl', {
            $scope: $scope,
            $window: $window
        });
        expect(MainCtrl).toBeDefined();
    }));

    it('set auth to true on userAuth.isAuthentication() success', inject(
        function ($controller, $rootScope) {
        userAuth = {
            isAuthenticated: function () {
              return true;
            }
        }
        $scope = $rootScope.$new();
        MainCtrl = $controller('MainCtrl', {
            $scope: $scope,
            $window: $window,
            userAuth: userAuth,
        });
        expect($scope.auth).toEqual(true);
    }));

    it('set auth to true on userAuth.obtainToken() success', function () {
        deferredObtainToken.resolve();
        $scope.$digest();
        expect($scope.auth).toEqual(true);
    });

    it('set auth to true on userAuth.newTokenByLoginModal() success', function () {
        deferredObtainToken.reject();
        $scope.$digest();
        deferredNewToken.resolve();
        $scope.$digest();
        expect($scope.auth).toEqual(true);
    });

    it('display toaster message on failure', function () {
        deferredObtainToken.reject();
        $scope.$digest();
        deferredNewToken.reject();
        $scope.$digest();

        expect(toaster.add).toHaveBeenCalledWith({
            type: 'sf-error',
            message: 'Could not get access token. ' +
            'Check AES_SETTINGS.auth config.'
        });
    });
});