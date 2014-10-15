'use strict';

/**
* A directive which creates formatting buttons for managing hyperlinks
* in Aloha editor's contents.
*
* @class sfAlohaFormatLink
*/
angular.module('authoringEnvironmentApp').directive('sfAlohaFormatLink', [
    '$rootScope',
    function ($rootScope) {
        var template = [
            '<div>',
            '  <button class="btn btn-default btn-sm" title="Add/Edit Link">',
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

            // TODO: docs
            function updateButtonsMode() {
                var title = linkPresent ? 'Edit Link' : 'Add Link';

                $btnLink.attr('title', title);

                // XXX: if current selection contains something?
                $btnLink.attr(
                    'disabled',
                    !cmdLinkSupported || !cmdLinkEnabled
                );

                $btnUnlink.attr(
                    'disabled',
                    !cmdUnlinkSupported || !cmdUnlinkEnabled || !linkPresent
                );
            }

            // TODO: docs
            function addLink() {
                // XXX: only if something  is selected? or select the
                // whole word, if nothing is selected?
                console.debug('Adding link http://www.sourcefabric.org/');
                Aloha.execCommand(
                    'createLink', false, 'http://www.sourcefabric.org/');
                linkPresent = true;
            }

            // TODO: docs
            function removeLink() {
                var url = Aloha.queryCommandValue('unlink');
                console.debug('Removing link', url);
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

            $btnLink.click(function () {
                if (linkPresent) {
                    console.debug('must edit link here...');
                } else {
                    // TODO: open a modal and ask for details
                    addLink();
                }

                updateButtonsMode();
            });

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
]);
