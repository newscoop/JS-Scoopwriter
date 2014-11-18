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
    'ui.bootstrap.dropdown',
    'ui.bootstrap.modal',
    'ui.select2',
    'gc.toaster',
    'angularFileUpload',
    'angularOauth'
]).config([
    '$routeProvider',
    '$httpProvider',
    '$buttonProvider',
    function ($routeProvider, $httpProvider, $buttonProvider) {
        $routeProvider
        .when(
            '/:language/:article', {
                templateUrl: 'views/main.html',
                resolve: {
                    articleInstance: [
                        'articleLoader',
                        function (articleLoader) {
                            return articleLoader();
                        }
                    ]
                }
            }
        )
        .when(
            '/', {
                template: '',
                controller: 'RedirectToArticleCtrl'
            }
        )
        .when(
            '/:callback*', {
                templateUrl:'views/oAuthCallback.html',
                controller: 'CallbackCtrl'
            }
        ).otherwise(
            // TODO: what here?
            {redirectTo: '/de/533522'}
        );

        $httpProvider.interceptors.push('authInterceptor');
        $buttonProvider.defaults.toggleEvent = 'change';
    }
])
.run(['$document', function ($document) {
    // default browser's handling of drops is annoying and thus unwanted
    $document.on('dragover drop', function (e) {
        e.preventDefault();
    });
}]);
