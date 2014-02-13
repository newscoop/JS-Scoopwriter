'use strict';

angular.module('authoringEnvironmentApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAlohaEditor',
  'mgcrea.ngStrap.helpers.dimensions',
  'mgcrea.ngStrap.tooltip',
  'mgcrea.ngStrap.popover'
])
  .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        templateUrl: 'views/authentication.html',
          controller: 'AuthenticationCtrl'
      });
    $httpProvider.interceptors.push('authInterceptor');
  }]);
