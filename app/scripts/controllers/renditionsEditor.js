(function () {
    'use strict';

    /**
    * Constructor function for the article preview modal controller.
    *
    * @class ModalCtrl
    */
    function ModalCtrl($modalInstance, $sce) {
        var self = this,
            url;

        // TODO: correct URL
        url = 'http://tageswoche-dev.lab.sourcefabric.org/admin/image/article/';

        self.url = $sce.trustAsResourceUrl(url);

        /**
        * Closes the modal.
        *
        * @method close
        */
        self.close = function () {
            $modalInstance.close();
        };
    }

    ModalCtrl.$inject = ['$modalInstance', '$sce'];


    /**
    * AngularJS controller for displaying a modal containing renditions editor.
    *
    * @class RenditionsEditorCtrl
    */
    angular.module('authoringEnvironmentApp')
    .controller('RenditionsEditorCtrl', [
        '$modal',
        function ($modal) {
            var self = this;

            /**
            * Opens a modal containing the renditions editor.
            *
            * @method openRenditionsEditor
            */
            self.openRenditionsEditor = function () {
                $modal.open({
                    templateUrl: 'views/modal-renditions-editor.html',
                    controller: ModalCtrl,
                    controllerAs: 'modalRenditionsCtrl'
                });
            };
        }
    ]);

}());
