'use strict';

angular.module('authoringEnvironmentApp')
  .controller('PaneTopicsCtrl', function ($scope) {
        $scope.topics = [
            {id:0, text:'Foo', selected:false},
            {id:1, text:'Bar', selected:true},
            {id:2, text:'Baz', selected:false},
            {id:3, text:'whatever', selected:false},
            {id:4, text:'lekker boeiend', selected:false},
            {id:5, text:'koekje', selected:false},
            {id:6, text:'cookie', selected:false},
            {id:7, text:'heee', selected:false},
            {id:8, text:'naja', selected:false}
        ];
        $scope.chosenTopics = [];

        $scope.addTopic = function() {
            $scope.topics.push({text:$scope.topicText, selected:false, id:$scope.topics[$scope.topics.length-1].id + 1});
            $scope.topicText = '';
        };

        $scope.deleteTopic = function(topic) {
            $scope.topics.splice($scope.topics.indexOf(topic), 1);
        }

        $scope.chooseTopic = function(topic) {
            topic.selected = true;
        }

        $scope.deleteChTopic = function(topic) {
            topic.selected = false;
        }
  });