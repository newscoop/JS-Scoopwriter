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
    function directiveConstructor($rootScope, $modal, $window) {
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
                var title,
                    textSelected;

                title = linkPresent ? 'Edit Link' : 'Add Link';
                $btnLink.attr('title', title);

                textSelected = !($window.getSelection().isCollapsed);

                // TODO: also, some editable must be active (need listener
                // on editable activated) - maybe outside of this function
                // where linkPresent is set
                // (we shouldn't enable the button when something outside the
                // editor is selected)
                $btnLink.attr(
                    'disabled',
                    !cmdLinkSupported || !cmdLinkEnabled ||
                    (!linkPresent && !textSelected)
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
            * @param linkData {Object} object containing link data
            *   (e.g. url, title...)
            * @return {Object} promise object which is resolved with form
            *   data if the OK button was clicked or rejected if Cancel
            *   button was clicked
            */
            function editLinkDialog(linkData) {
                var dialog = $modal.open({
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
                var selection,
                    $node,
                    $parent;

                // Aloha's unlink command only removes the href attribute, but
                // if there are other  attributes, the anchor element is not
                // removed - we must do that manually
                selection = $window.getSelection();
                $node = $(selection.anchorNode);

                // if link node is selected, remove it, otherwise a text node
                // is selected and we need to go up the DOM hierarchy to find
                // the ancestor link node and remove it (it might be several
                // levels above the text node as other DOM nodes might be
                // in-between, e.g. a <b> tag
                if ($node[0].nodeName.toUpperCase() === 'A') {
                    $node.replaceWith($node.html());
                } else {
                    $parent = $node.parent();
                    while ($parent.length > 0) {
                        if ($parent[0].nodeName.toUpperCase() === 'A') {
                            $node.unwrap();
                            break;
                        } else {
                            $node = $parent;
                            $parent = $parent.parent();
                        }
                    }
                }

                linkPresent = false;
            }

            /**
            * Makes browser's selection to contain the text of the given
            * link node.
            *
            * @function highlightLink
            * @param {Object} jQuery-wrapped link DOM node
            */
            function highlightLink($linkNode) {
                var range,
                    selection;

                selection = $window.getSelection();
                selection.removeAllRanges();

                range = new Range();
                range.setStart($linkNode[0], 0);
                range.setEnd($linkNode[0], 1);
                // TODO: select all nested DOM subtree as well!

                selection.addRange(range);
            }

            /// --- initialization --- ///

            // store references to both buttons and get rid of the
            // wrapping <div> element
            children = element.children();
            $btnLink = $(children[0]);
            $btnUnlink = $(children[1]);
            children.unwrap();

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

            $rootScope.$on('texteditor-selection-changed', function () {
                linkPresent = !!Aloha.queryCommandValue('createLink');
                updateButtonsMode();
            });

            // Add/Edit link button's click handler
            $btnLink.click(function () {
                var linkData = {},
                    range,
                    selection,
                    $link;

                selection = $window.getSelection();
                $link = $(selection.anchorNode);

                // find link node up in the DOM hierarchy
                while (
                    $link.length > 0 &&
                    $link[0].nodeName.toUpperCase() !== 'A'
                ) {
                    $link = $link.parent();
                }

                if ($link.length > 0) {
                    // will edit existing link in modal
                    linkData.url = $link.attr('href');
                    linkData.title = $link.attr('title');
                    linkData.openNewWindow =
                        ($link.attr('target') === '_blank');

                    highlightLink($link);
                } else {
                    // will add new link in modal
                    linkData.title = selection.toString();
                    range = selection.getRangeAt(0);
                }

                // open the add/edit link dialog and do the required
                // action if the OK button has been clicked
                editLinkDialog(linkData).then(function (newLinkData) {
                    if ($link.length <= 0) {
                        // a new link must bee created
                        $link = jQuery('<a/>');
                        range.surroundContents($link[0]);
                        // TODO: strip any existing links in subtree!
                    }

                    $link.attr('href', newLinkData.url);
                    $link.attr('title', newLinkData.title);
                    $link.removeAttr('target');

                    if (newLinkData.openNewWindow) {
                        $link.attr('target', '_blank');
                    }

                    highlightLink($link);
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
            '$rootScope', '$modal', '$window', directiveConstructor
        ]);

}());
