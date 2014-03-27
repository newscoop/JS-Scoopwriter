'use strict';

angular.module('authoringEnvironmentApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAlohaEditor',
  'mgcrea.ngStrap.button',
  'mgcrea.ngStrap.helpers.dimensions',
  'mgcrea.ngStrap.tooltip',
  'mgcrea.ngStrap.popover',
  'angularFileUpload'
])
  .config(['$routeProvider', '$httpProvider', '$buttonProvider', function ($routeProvider, $httpProvider, $buttonProvider) {
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
    $buttonProvider.defaults.toggleEvent = 'change';
  }]);
