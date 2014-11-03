(function () {
    'use strict';

    function DirectiveController($rootScope) {
        var toolbars = [];

        /**
        * Toggles visibility of the given image edit toolbar. If the toolbar
        * is going to become visible, it also hides all other toolbars.
        *
        * NOTE: When the method is invoked for the first time for a particular
        * toolbar, it adds it to the internal list of existing toolbars.
        *
        * @method toggleToolbar
        * @param $toolbar {Object} jQuery instance of the toolbar DOM node
        */
        this.toggleToolbar = function ($toolbar) {
            var isHidden = ($toolbar.css('display') === 'none');

            if (!_.find(toolbars, $toolbar)) {
                toolbars.push($toolbar);
            }

            if (isHidden) {
                // $toolbar will become visible, thus hide all others
                toolbars.forEach(function ($item) {
                    $item.hide();
                });
            }

            // NOTE: there is a bug in toggle() method in tests (hiding a
            // visible element), thus we explicitly tell jQuery whether to
            // show the element or not
            $toolbar.toggle(isHidden);
        };

        /**
        * Stops tracking the given image edit toolbar. Must be invoked when
        * the corresponding dropped image is removed from the editor content.
        *
        * @method deregisterToolbar
        * @param $toolbar {Object} jQuery instance of the toolbar DOM node
        */
        this.deregisterToolbar = function ($toolbar) {
            _.remove(toolbars, $toolbar);
        };

        // Hide all toolbars if editable is deactivated (the user has clicked
        // outside an editable, meaning that he is probably not interested in
        // editing the image anymore).
        $rootScope.$on('texteditor-editable-deactivated', function () {
            toolbars.forEach(function ($item) {
                $item.hide();
            });
        });
    }

    DirectiveController.$inject = ['$rootScope'];


    /**
    * A directive which makes an HTML element aware of the dropped images
    * beneath it in the DOM tree.
    *
    * @class droppedImagesContainer
    */
    angular.module('authoringEnvironmentApp')
    .directive('droppedImagesContainer', function () {
        return {
            restrict: 'A',
            controller: DirectiveController
        };
    });

}());
