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

        /**
        * Makes the given source to be the new selected image source.
        *
        * @method select
        * @param source {Object} object containing image source information
        *   @param source.value {String} unique identifier of the source
        *   @param source.url {String} template URL for the source
        *   @param source.description {String} description of the source as
        *       shown to users
        */
        $scope.select = function (source) {
            $scope.selected = source;
        };

        /**
        * Triggers uploading of all the images in the image upload list and
        * when done, resets the upload list and closes the modal.
        *
        * @method uploadImages
        */
        $scope.uploadImages = function () {
            var uploadPromises = images.uploadAll();

            $q.all(uploadPromises).then(function (data) {
                images.attachAllUploaded();
                images.images2upload = [];
                modal.hide();
            });
        };

        /**
        * Triggers discarding all the changes in image basket and image upload
        * list and closes the modal.
        *
        * @method discardChanges
        * @param $event {Object} AngularJS event object of the event that
        *     triggered the method.
        */
        $scope.discardChanges = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            images.discardAll();
            modal.hide();
        };

    }
]);
