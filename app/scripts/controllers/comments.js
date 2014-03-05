'use strict';

angular.module('authoringEnvironmentApp')
    .controller('CommentsCtrl', ['$scope', 'comments', function ($scope, comments) {
        var others = ['new', 'approved', 'hidden'];
        $scope.toggle = function(name) {
            var previouslyChecked = $scope.statuses[name];
            $scope.statuses[name] = !previouslyChecked;
            if ('all' == name) {
                if (previouslyChecked) {
                    others.map(function(name) {
                        $scope.statuses[name] = true;
                    });
                } else {
                    others.map(function(name) {
                        $scope.statuses[name] = false;
                    });
                }
            } else {
                /* if this is going to be unchecked (so it was checked
                 * before) and all the others are unchecked, check the
                 * `all` status again */
                if (previouslyChecked) {
                    if (others.every(function(name) {
                        return false == $scope.statuses[name];
                    })) {
                        $scope.statuses.all = true;
                    }
                } else {
                    $scope.statuses.all = false;
                }
            }
        };
        $scope.statuses = {
            all: true,
            'new': false, // reserved word
            approved: false,
            hidden: false
        };
        $scope.selected = function(comment) {
            if ($scope.statuses.all) {
                return true;
            }
            if ($scope.statuses[comment.status]) {
                return true;
            }
            return false;
        };

         // whether or not a new comment is being sent at this very moment
        $scope.isSending = false;

        $scope.comments = comments;
        $scope.create = {};
        comments.init();
        $scope.add = function(par) {
            $scope.isSending = true;
            // XXX: on errors isSending is not set back to false,
            // leaving the add comment form disabled
            comments.add(par).then(function() {
                $scope.adding = false; // collapse the form
                $scope.isSending = false;
                $scope.create = {};
            });
        };
        $scope.cancel = function() {
            $scope.adding = false;
            $scope.create = {};
        };
        $scope.globalShowStatus = 'collapsed';
        $scope.$watch('globalShowStatus', function() {
            comments.displayed.map(function(comment) {
                comment.showStatus = $scope.globalShowStatus;
            });
        });
    }]);
