'use strict';

/**
* A directive which allows dropping images and HTML snippets into
* Aloha editables.
*
* @class sfDroppable
*/
angular.module('authoringEnvironmentApp').directive('sfDroppable', [
    '$compile',
    'Dragdata',
    function ($compile, Dragdata) {
        var place,
            placeholderClass,
            sel;

        sel = 'h1, h2, h3, h4, h5, h6, ol, p, pre, table, ul';
        placeholderClass = 'drag-drop-placeholder';
        place = '.' + placeholderClass;

        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var counter,
                    $element = $(element);

                // when dragging over a child element, a dragleave event is
                // fired on on the parent, but we only want to react when
                // mouse leaves the parent element itself, hence the need
                // for a counter
                counter = 0;

                /**
                * Creates a new drag-drop placeholder DOM element.
                *
                * @function createPlaceholder
                * @return {Object} created DOM element
                */
                function createPlaceholder() {
                    var $node = $('<div>&nbsp;</div>')
                        .addClass(placeholderClass)
                        .attr('contenteditable', false);

                    return $node;
                }

                /**
                * onDrop event handler. Resets counter, removes all drag-drop
                * placeholders and creates a new DOM node in the editable
                * based on the drop event data.
                *
                * @function onDrop
                * @param e {Object} event object
                */
                function onDrop(e) {
                    var dropped,
                        newNode,
                        $target = $(e.target),
                        alohaEditable = Aloha.getEditableById(
                            $element.attr('id')
                        );

                    e.preventDefault();
                    e.stopPropagation();

                    counter = 0;
                    $(place).remove();  // remove all drag-drop placeholders
 
                    var data = e.originalEvent.dataTransfer.getData('Text');
                    if (data) {
                        dropped = Dragdata.getDropped(data);
                        newNode = $compile(dropped)(scope);
                    }

                    if ($target.is(sel)) {
                        $target.after(newNode);
                    } else {
                        $element.prepend(newNode);
                    }
                    // force a change update to enable the save button
                    scope.$emit('texteditor-content-changed', e, alohaEditable);
                }

                /// event listeners for Aloha editable's children ///
                $element.on('dragover', sel, function (e) {
                    var $target = $(e.target);
                    if (!$target.next().is(place)) {
                        $target.after(createPlaceholder());
                    }
                });

                $element.on('dragleave', sel, function (e) {
                    var $nxtNode = $(e.target).next();
                    if ($nxtNode.is(place)) {
                        $nxtNode.remove();
                    }
                });

                $element.on('drop', sel, onDrop);

                /// special case for adding/removing a placeholder ///
                /// to the very beginning of the Aloha editable  ///
                $element.on('dragenter', function (e) {
                    var $placeholder;

                    counter++;

                    if (!$element.children(':first').is(place)) {
                        $placeholder = createPlaceholder();

                        $placeholder.on('dragenter', function () {
                            $placeholder.addClass('drag-over');
                        });

                        $placeholder.on('dragleave', function () {
                            $placeholder.removeClass('drag-over');
                        });

                        $element.prepend($placeholder);
                    }
                });

                $element.on('dragleave', function (e) {
                    var firstChild = $element.children(':first');

                    counter--;

                    if ((counter < 1) && firstChild.is(place)) {
                        firstChild.remove();
                    }
                });

                $element.on('drop', onDrop);
            }
        };
    }
]);
