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
    'ngTagsInput'
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
            // when properlly configured user will be redirected
            // otherwise show them the error page
            '/', {
                templateUrl: 'views/error.html',
                controller: 'RedirectToArticleCtrl',
                controllerAs: 'redirectToArticleCtrl'
            }
        )
        .when(
            // loaded when the login form in performs a redirect (in modal's
            // iframe)
            '/:callback*', {
                templateUrl:'views/oAuthCallback.html',
                controller: ''
            }
        )
        .otherwise(
            {redirectTo: '/'}
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
