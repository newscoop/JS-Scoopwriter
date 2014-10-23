'use strict';

/**
* AngularJS controller for the Info pane.
*
* @class PaneInfoCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneInfoCtrl', [
    '$scope',
    'article',
    function ($scope, article) {
        article.promise.then(function (articleData) {
            $scope.article = articleData;
        });
    }
]);
