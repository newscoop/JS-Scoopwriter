'use strict';

/**
* A directive which automatically positions the item list's vertical offset so
* that it does not prevent with the add new element form.
* Used at snipppets pane.
*
* @class autoListOffset
*/

angular.module('authoringEnvironmentApp').directive('autoListOffset', [
    function () {
        return {
            restrict: 'A',
            link: function postLink(scope, $element, attrs) {
                var baseOffsetY = 125,  // base offset (without from height)
                    initialOffsetY = 150,  // initial offset at pane load
                    firstAdjustment = true,
                    $formBox,
                    $list;

                $formBox = $element.find('.paneFormWrapper');
                $list = $element.find('.list');

                /**
                * Sets the item list's offset from the top to avoid overlapping
                * with the "add new" form.
                *
                * @function adjustOffset
                */
                function adjustOffset() {
                    var offsetY = Math.round($formBox.outerHeight());

                    if (offsetY === 0) {
                        // happens when pane gets closed - don't do anything,
                        // instead just preserve the current offset
                        return;
                    }

                    if (firstAdjustment) {  // pane opened for the first time
                        offsetY = initialOffsetY;
                        firstAdjustment = false;
                    } else {
                        offsetY += baseOffsetY;
                    }

                    $list.css('top', offsetY);
                }

                // watch for height changes and react accordingly
                $formBox.mutate('height', function (element, info) {
                    adjustOffset();
                });

                adjustOffset();
            }
        };
    }
]);