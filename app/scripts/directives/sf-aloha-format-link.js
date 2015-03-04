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
    * @param addingNew {Boolean} true if new link is being added, false if
    *   existing link is being edited
    */
    function ModalCtrl($scope, $modalInstance, linkData, addingNew) {

        $scope.linkData = {};

        ['url', 'text', 'title'].forEach(function (item) {
            $scope.linkData[item] = linkData[item];
        });
        $scope.linkData.openNewWindow = !!linkData.openNewWindow;
        $scope.addingNew = addingNew;

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

    ModalCtrl.$inject = ['$scope', '$modalInstance', 'linkData', 'addingNew'];


    /**
    * A directive which creates formatting buttons for managing hyperlinks
    * in Aloha editor's contents.
    *
    * @class sfAlohaFormatLink
    */
    function directiveConstructor($rootScope, $modal, $window, toaster) {
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
                var editables,
                    blocks,
                    selection = $window.getSelection(),
                    testRange,
                    selectionInEditor,
                    textSelected,
                    canSurround = true,
                    title;

                editables = $(selection.anchorNode).parents('.aloha-editable');
                blocks = $(selection.anchorNode).parents('.aloha-block');
                selectionInEditor = editables.length > 0 || blocks.length > 0;

                /**
                * test if we can surround text
                * this will fail if divs are present due to an issue
                * calling surroundContents wih divs
                */
                if (selection.type === 'Range') {
                    testRange = selection.getRangeAt(0);
                    if (testRange
                        .commonAncestorContainer instanceof HTMLDivElement) {
                        canSurround = false;
                    } else {
                        canSurround = true;
                    }
                }

                textSelected = !selection.isCollapsed;

                $btnLink.attr(
                    'disabled',
                    !cmdLinkSupported || !cmdLinkEnabled || !canSurround ||
                    !selectionInEditor || (!linkPresent && !textSelected)
                );

                $btnUnlink.attr(
                    'disabled',
                    !cmdUnlinkSupported || !cmdUnlinkEnabled ||
                    !selectionInEditor || !linkPresent
                );

                title = linkPresent ? 'Edit Link' : 'Add Link';
                $btnLink.attr('title', title);
            }

            /**
            * Opens the edit link modal dialog.
            *
            * @function editLinkDialog
            * @param linkData {Object} object containing link data
            *   (e.g. url, title...)
            * @param addingNew {Boolean} true if new link is being added,
            *   false otherwise (i.e.an existing link is being  edited)
            * @return {Object} promise object which is resolved with form
            *   data if the OK button was clicked or rejected if Cancel
            *   button was clicked
            */
            function editLinkDialog(linkData, addingNew) {
                var dialog = $modal.open({
                    templateUrl: 'views/modal-edit-link.html',
                    controller: ModalCtrl,
                    scope: scope,
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        linkData: function () {
                            return linkData;
                        },
                        addingNew: function () {
                            return addingNew;
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
                    $link;

                // Aloha's unlink command only removes the href attribute, but
                // if there are other  attributes, the anchor element is not
                // removed - we must do that manually
                selection = $window.getSelection();
                $link = $(selection.anchorNode).closest('a');

                if ($link.length > 0) {
                    $link.replaceWith($link.html());
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
                range.setEnd($linkNode[0], $linkNode[0].childNodes.length);

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
                var addingNew,  // adding new or editing an existing link?
                    linkData = {},
                    range,
                    selection = $window.getSelection(),
                    $link;

                // find the closest link node up in the DOM hierarchy
                // (including the currently selected node)
                $link = $(selection.anchorNode).closest('a');

                addingNew = $link.length <= 0;
                if (addingNew) {
                    range = selection.getRangeAt(0);
                } else {
                    linkData.url = $link.attr('href');
                    linkData.title = $link.attr('title');
                    linkData.openNewWindow =
                        ($link.attr('target') === '_blank');

                    highlightLink($link);
                }

                linkData.text = selection.toString();

                // open the add/edit link dialog and do the required
                // action if the OK button has been clicked
                editLinkDialog(linkData, addingNew)
                .then(function (newData) {
                    if (addingNew) {
                        // a new link must be created
                        $link = jQuery('<a/>');
                        try {
                            range.surroundContents($link[0]);

                            // also remove any existing nested links
                            $link.find('a').each(function (i, item) {
                                var $nestedLink = $(item);
                                $nestedLink.replaceWith($nestedLink.html());
                            });
                        } catch (exception) {
                            toaster.add({
                                type: 'sf-error',
                                message: 'Invalid selection.  ' +
                                    'Please only select text.'
                            });
                            console.log('Error: ', exception);
                        }
                    }

                    $link.attr('href', newData.url);
                    $link.attr('title', newData.title);

                    if (newData.openNewWindow) {
                        $link.attr('target', '_blank');
                    } else {
                        $link.removeAttr('target');
                    }

                    highlightLink($link);
                    linkPresent = true;
                })
                .finally(function () {
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
            '$rootScope', '$modal', '$window', 'toaster', directiveConstructor
        ]);

}());
