(function () {
    'use strict';

    /**
    * Constructor function for the add/edit link modal controller.
    *
    * @class ModalCtrl
    * @param $scope {Object} AngularJS $scope object
    * @param $modalInstance {Object} AngularJS UI instance of the modal
    *     window the coontroller controls.
    * @param linkData {Object} object with link data (e.g. url, title...)
    */
    function ModalCtrl($scope, $modalInstance, linkData) {

        $scope.linkData = {};

        ['url', 'text', 'title'].forEach(function (item) {
            $scope.linkData[item] = linkData[item];
        });
        $scope.linkData.openNewWindow = !!linkData.openNewWindow;

        /**
        * Closes the modal with a resolution of OK.
        * @method ok
        */
        $scope.ok = function () {
            $modalInstance.close($scope.linkData);
        };

        /**
        * Closes the modal with a resolution of CANCEL.
        * @method cancel
        */
        $scope.cancel = function () {
            $modalInstance.dismiss(false);
        };
    }

    ModalCtrl.$inject = ['$scope', '$modalInstance', 'linkData'];


    /**
    * A directive which creates formatting buttons for managing hyperlinks
    * in Aloha editor's contents.
    *
    * @class sfAlohaFormatLink
    */
    function directiveConstructor($rootScope, $modal) {
        var template = [
            '<div>',
            '  <button class="btn btn-default btn-sm" title="Add Link">',
            '      <i class="fa fa-link"></i>',
            '  </button>',
            '  <button class="btn btn-default btn-sm" title="Remove Link">',
            '      <i class="fa fa-unlink"></i>',
            '  </button>',
            '</div>'
        ].join('');

        function postLink(scope, element, attrs) {
            var children,
                cmdLinkEnabled,
                cmdLinkSupported,
                cmdUnlinkEnabled,
                cmdUnlinkSupported,
                // does the current text selection contain a link or not?
                linkPresent = false,
                $btnLink,
                $btnUnlink;

            /**
            * Updates the formatting buttons appearance depending on whether
            * or not a hyperlink is present in the currently selected text.
            *
            * @function updateButtonsMode
            */
            function updateButtonsMode() {
                var title = linkPresent ? 'Edit Link' : 'Add Link';

                $btnLink.attr('title', title);

                // XXX: only if current selection contains something?
                $btnLink.attr(
                    'disabled',
                    !cmdLinkSupported || !cmdLinkEnabled
                );

                $btnUnlink.attr(
                    'disabled',
                    !cmdUnlinkSupported || !cmdUnlinkEnabled || !linkPresent
                );
            }

            /**
            * Opens the edit link modal dialog.
            *
            * @function editLinkDialog
            * @return {Object} promise object which is resolved with form
            *   data if the OK button was clicked or rejected if Cancel
            *   button was clicked
            */
            function editLinkDialog() {
                var dialog,
                    linkData;

                if (linkPresent) {
                    linkData = {
                        url: Aloha.queryCommandValue('createLink'),
                        text: 'TODO: get selection text',
                        title: 'TODO:get link tooltip title',
                        openNewWindow: false
                    };
                } else {
                    linkData = {};
                }

                dialog = $modal.open({
                    templateUrl: 'views/modal-edit-link.html',
                    controller: ModalCtrl,
                    scope: scope,
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        linkData: function () {
                            return linkData;
                        }
                    }
                });

                return dialog.result;
            }

            /**
            * Removes hyperlink from the currently active text in editor.
            *
            * @function removeLink
            */
            function removeLink() {
                Aloha.execCommand('unlink');
                linkPresent = false;
            }

            /// --- initialization --- ///

            // get rid of the wrapping <div> element
            children = element.children();
            $btnLink = $(children[0]);
            $btnUnlink = $(children[1]);

            children.appendTo(element.parent());
            element.remove();

            // determine if link/unlink commands are supported and enabled
            // in the editor
            cmdLinkSupported = Aloha.queryCommandSupported('createLink');
            cmdLinkEnabled = Aloha.queryCommandEnabled('createLink');
            if (typeof cmdLinkEnabled === 'undefined') {
                // in Chrome we get undefined, fix it to "true"
                cmdLinkEnabled = true;
            }

            cmdUnlinkSupported = Aloha.queryCommandSupported('unlink');
            cmdUnlinkEnabled = Aloha.queryCommandEnabled('unlink');
            if (typeof cmdUnlinkEnabled === 'undefined') {
                // in Chrome we get undefined, fix it to "true"
                cmdUnlinkEnabled = true;
            }

            // update button's mode of operation on every text selection
            // change in the editor
            $rootScope.$on('texteditor-selection-changed', function () {
                linkPresent = !!Aloha.queryCommandValue('createLink');
                updateButtonsMode();
            });

            // Add/Edit link button's click handler
            $btnLink.click(function () {
                // TODO: bug - remember current selection and update it
                // - lost focus with modal, so remember position
                // also, do nothing if nothing  is selected (disable
                // button)

                editLinkDialog().then(function (linkData) {
                    Aloha.execCommand('createLink', false, linkData.url);
                    linkPresent = true;
                    updateButtonsMode();
                });
            });

            // Remove link button's click handler
            $btnUnlink.click(function () {
                if (linkPresent) {
                    removeLink();
                    updateButtonsMode();
                }
            });

            updateButtonsMode();
        }

        return {
            template: template,
            restrict: 'E',
            replace: true,
            scope: {},
            link: postLink
        };
    }


    angular.module('authoringEnvironmentApp')
        .directive('sfAlohaFormatLink', [
            '$rootScope', '$modal', directiveConstructor
        ]);

}());
