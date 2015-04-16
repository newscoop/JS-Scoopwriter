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
    'toaster',
    'TranslationService',
    function ($scope, $q, images, modal, toaster, TranslationService) {
        $scope.root = AES_SETTINGS.API.rootURI;
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
                description: 'Media Archive'
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
        * Triggers attaching all images in the basket to the article, then
        * clears the basket and closes the modal.
        *¸
        * @method attachCollected
        */
        $scope.attachCollected = function () {
            images.attachAllCollected().then(function () {
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.images.attach.success'
                    )
                });
                images.discardAll();  // clear the basket
                modal.hide();
            }, function () {
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.images.attach.error'
                    )
                });
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
            // we need to cancel the click event so that modal machinery
            // does not close the modal immediately - we first need to
            // do some other work and only then close the modal by ourselves
            $event.preventDefault();
            $event.stopPropagation();
            images.discardAll();
            modal.hide();
        };

    }
]);
