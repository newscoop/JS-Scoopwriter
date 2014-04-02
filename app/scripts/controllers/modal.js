'use strict';
angular.module('authoringEnvironmentApp').controller('ModalCtrl', [
    '$scope',
    'modal',
    function ($scope, modal, images) {
        $scope.modal = modal;
    }
]);