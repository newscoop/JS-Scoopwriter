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
  // devcode: !newscoop
  .constant('endpoint', 'http://tw-merge.lab.sourcefabric.org')
  // endcode
  // devcode: newscoop
  .constant('endpoint', '')
  // endcode
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
