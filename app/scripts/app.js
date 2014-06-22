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
    'template/modal/backdrop.html',
    'template/modal/window.html',
    'ui.bootstrap.modal',
    'ui.select2',
    'angularFileUpload',
    'angularOauth'
]).config([
    '$routeProvider',
    '$httpProvider',
    '$buttonProvider',
    function ($routeProvider, $httpProvider, $buttonProvider) {
        $routeProvider.when('/:language/:article', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        }).when('/callback/', {
            templateUrl:'views/oAuthCallback.html',
            controller: ''
        }).otherwise({
            redirectTo: '/de/123'
            //templateUrl: 'views/authentication.html',
            //controller: 'AuthenticationCtrl'
        });
        //$httpProvider.interceptors.push('authInterceptor');
        $buttonProvider.defaults.toggleEvent = 'change';
    }
])
.run(['$document', function ($document) {
    // default browser's handling of drops is annoying and thus unwanted
    $document.on('dragover drop', function (e) {
        e.preventDefault();
    });
}]);
