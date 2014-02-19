'use strict';

angular.module('authoringEnvironmentApp')
    .controller('CommentsCtrl', ['$scope', 'comments', function ($scope, comments) {
        $scope.comments = comments;
        $scope.create = {};
        comments.init();
        $scope.add = function(par) {
            comments.add(par).then(function() {
                $scope.adding = false; // collapse the form
                $scope.create = {};
            });
        };
        $scope.cancel = function() {
            $scope.adding = false;
            $scope.create = {};
        };
    }]);
