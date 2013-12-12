'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ToolbarCtrl', function ($scope, $filter) {
    $scope.stylers = [
        {element: 'p', name:'Normal Text'}, 
        {element: 'h1', name:'Heading 1'},
        {element: 'h2', name:'Heading 2'},
        {element: 'h3', name:'Heading 3'},
        {element: 'h4', name:'Heading 4'},
        {element: 'h5', name:'Heading 5'},
        {element: 'pre', name:'Preformatted'}
    ]

    $scope.active = $filter('filter')($scope.stylers, {element:"p"}, true)[0].name;

    var updateScope = function () {
        var commandValue = Aloha.queryCommandValue('formatBlock');
        $scope.active = $filter('filter')($scope.stylers, {element:commandValue}, true)[0].name;
        $scope.$apply();
    };
    Aloha.ready(function () {
        Aloha.bind('aloha-selection-changed', function () {
            updateScope();
        });
        Aloha.bind('aloha-command-executed', function () {
            updateScope();
        });
    });
  });
