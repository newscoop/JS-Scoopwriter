'use strict';

/**
* A directive which creates a formatting button for managing hyperlinks
* in Aloha editor's contents.
*
* @class sfAlohaFormatLink
*/
angular.module('authoringEnvironmentApp').directive('sfAlohaFormatLink', [
    '$rootScope',
    function ($rootScope) {
        var template = [
            '<button class="btn btn-default btn-sm" title="Add Link">',
            '    <i class="fa fa-link"></i>',
            '</button>'
        ].join('');

        function postLink(scope, element, attrs) {
            var cmdEnabled,
                cmdSupported,
                // does the current text selection contain a link or not?
                linkPresent = false,
                $icon = element.children('i');

            // TODO: docs
            function updateButtonMode() {
                var title;

                title = linkPresent ? 'Remove Link' : 'Add Link';
                element.attr('title', title);

                if (linkPresent) {
                    $icon.removeClass('fa-link');
                    $icon.addClass('fa-unlink');
                } else {
                    $icon.removeClass('fa-unlink');
                    $icon.addClass('fa-link');
                }
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

            // update button's mode of operation on every text selection
            // change in the editor
            $rootScope.$on('texteditor-selection-changed', function () {
                linkPresent = !!Aloha.queryCommandValue('createLink');
                updateButtonMode();
            });

            element.bind('click', function () {
                if (linkPresent) {
                    removeLink();
                } else {
                    // TODO: open a modal and ask for details
                    addLink();
                }

                updateButtonMode();
            });

            /// initialization ///
            cmdSupported = Aloha.queryCommandSupported('createLink');
            cmdEnabled = Aloha.queryCommandEnabled('createLink');
            if (typeof cmdEnabled === 'undefined') {
                // in Chrome we get undefined, fix it to "true"
                cmdEnabled = true;
            }
            element.attr('disabled', !cmdSupported || !cmdEnabled);

            updateButtonMode();
        }

        return {
            template: template,
            restrict: 'A',
            replace: true,
            scope: {},
            link: postLink
        };
    }
]);
