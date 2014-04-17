'use strict';

/**
* AngularJS controller for a modal in which user can attach images
* to an article.
*
* @class AttachImageCtrl
*/
angular.module('authoringEnvironmentApp').controller('AttachImageCtrl', [
    '$scope',
    '$q',
    'images',
    'modal',
    'configuration',
    function ($scope, $q, images, modal, configuration) {

        $scope.root = configuration.API.rootURI;
        $scope.images = images;

        $scope.sources = [
            {
                value: 'computer',
                url: 'views/attach-image/computer.html',
                description: 'From Computer'
            },
            /* {
                value: 'web',
                url: 'views/attach-image/web.html',
                description: 'From Web'
            }, */
            {
                value: 'archive',
                url: 'views/attach-image/archive.html',
                description: 'From Media Archive'
            }
        ];

        $scope.selected = $scope.sources[1];

        $scope.select = function (source) {
            $scope.selected = source;
        };

        // TODO: docstring ad tests
        $scope.uploadImages = function () {
            var uploadPromises;

            uploadPromises = images.uploadAll();

            $q.all(uploadPromises).then(function (data) {
                console.log('all images uploaded');
                // then attach all
                //modal.hide();
            });
        };

        // TODO: docstring ad tests
        $scope.discardChanges = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            images.discardAll();
            modal.hide();
        };

    }
]);
