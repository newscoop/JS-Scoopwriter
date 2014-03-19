'use strict';

angular.module('authoringEnvironmentApp')
    .controller('CommentsCtrl', ['$scope', 'comments', '$log', function ($scope, comments, $log) {
        var others = ['new', 'approved', 'hidden'];
        $scope.sortings = [{
            text: 'Nested'
        }, {
            text: 'Chronological'
        }];
        $scope.sorting = $scope.sortings[0];
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
            comments.add(par).then(function() {
                $scope.adding = false; // collapse the form
                $scope.isSending = false;
                $scope.create = {};
            }, function () {
                // on failures (e.g. timeouts) we re-enable the form, allowing
                // user to submit a comment again
                $scope.isSending = false;
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
        $scope.$watch('sorting', function() {
            /* this log here is a way to test that the handler has
             * been called, it is mocked in tests */
            $log.debug('sorting changed');
            if(comments.canLoadMore) {
                if ($scope.sorting.text == 'Nested') {
                    comments.init({
                        sorting: 'nested'
                    });
                } else {
                    comments.init({
                        sorting: 'chronological'
                    });
                }
            }
        });
    }]);
