'use strict';

/**
* A directive which enables changing the order of container's children by
* drag and drop operations.
*
* @class dragSort
*/

angular.module('authoringEnvironmentApp').directive('dragSort', [
    function () {

        var newIdx = -1,  // dragged element's (potential) new position
            $emptySlot = null,  // DOM marker for the new position
            $rootElement,  // root DOM element the directive is applied to
            draggedElementIdx = -1;  // index of the element being dragged

        /**
        * Sets drag-n-drop event handlers for the given node, making it
        * draggable.
        *
        * @method setEventHandlers
        * @param $element {Object} jQuery-wrapped DOM element for which to set
        *   the event handlers
        */
        var setEventHandlers = function ($element) {
            $element.attr('draggable', true);

            $element.on('dragstart', function (e) {
                var dragData;

                $rootElement.children().each(function (i, child) {
                    $(child).attr('data-sort-index', i);
                });

                dragData = {
                    sortIndex: parseInt($element.attr('data-sort-index'), 10)
                };
                draggedElementIdx = dragData.sortIndex;

                e.originalEvent.dataTransfer.setData(
                    'text/plain', JSON.stringify(dragData));

                e.originalEvent.dataTransfer.effectAllowed = 'move';

                $element.addClass('dragged');
            });

            // cleanup and reset stuff when dragging ends
            $element.on('dragend', function (e) {
                $element.removeClass('dragged');

                if ($emptySlot) {
                    $emptySlot.remove();
                }

                $rootElement.children().each(function (i, child) {
                    $(child).removeAttr('data-sort-index');
                });

                newIdx = -1;
                draggedElementIdx = -1;
            });

            $element.on('dragenter', function (e) {
                e.originalEvent.preventDefault();  // allow drop (for IE)
                e.originalEvent.dataTransfer.dropEffect = 'move';
            });

            $element.on('dragover', function (e) {
                var elementHeight,  // dragged DOM element's height
                    dropIdx,
                    posY,  // mouse Y position relative to $element
                    $child,
                    sortIdx = parseInt($element.attr('data-sort-index'), 10);

                e.originalEvent.preventDefault();  // allow drop
                e.originalEvent.dataTransfer.dropEffect = 'move';

                // determine if drop index should be changed
                // (if it crosses the Y-midpoint of the element)
                if (e.offsetY === undefined) {  // Firefox
                    posY = e.originalEvent.pageY - $element.offset().top;
                } else {
                    posY = e.originalEvent.offsetY;
                }

                elementHeight = $element.outerHeight();

                if (posY < elementHeight / 2) {
                    dropIdx = sortIdx;
                } else {
                    dropIdx = sortIdx + 1;
                }

                // if new element index different from the current one,
                // update it and add DOM placeholder (for the gap)
                if (dropIdx !== newIdx) {

                    newIdx = dropIdx;

                    // append empty slot before the child at newIdx
                    // if no child (last index), append to the end
                    if ($emptySlot) {
                        $emptySlot.remove();
                    }
                    // prevent showing new item slot right before or after the
                    // dragged element itself (would make no sense, dropping
                    // there would not change the order)
                    if (newIdx === draggedElementIdx ||
                        newIdx === draggedElementIdx + 1
                    ) {
                        return;
                    }

                    $emptySlot = $('<div class="new-item-slot"></div>');
                    $child = $rootElement.children().eq(newIdx);

                    if ($child.length > 0) {
                        $emptySlot.insertBefore($child);
                    } else {
                        $rootElement.append($emptySlot);
                    }
                }
            });

            $element.on('drop', function (e) {
                e.preventDefault();
                // let the drop even through to the parent container, thus
                // don't call e.stopPropagation()
            });
        };

        /**
        * Sets drag-n-drop event handlers for the container of the nodes
        * representing the items in collection.
        *
        * @method setContainerEventHandlers
        * @param $container {Object} jQuery-wrapped DOM element representing
        *   the container
        * @param scope {Object} scope of the directive
        */
        var setContainerEventHandlers = function ($container, scope) {
            $container.on('dragover', function (e) {
                e.originalEvent.preventDefault();  // allow drop
                e.originalEvent.dataTransfer.dropEffect = 'move';
            });

            $container.on('dragenter', function (e) {
                e.originalEvent.preventDefault();  // allow drop (IE)
                e.originalEvent.dataTransfer.dropEffect = 'move';
            });

            $container.on('drop', function (e) {
                var dragData,
                    item,      // item that was dragged around
                    oldIndex;  // item's original index in collection

                e.preventDefault();
                e.stopPropagation();

                dragData = e.originalEvent.dataTransfer.getData('text/plain');
                dragData = JSON.parse(dragData);

                oldIndex = dragData.sortIndex;

                if (newIdx > oldIndex) {
                    // there is an extra drop slot after the dragged item,
                    // thus new position index equals (slot index - 1)
                    newIdx -= 1;
                }

                if (oldIndex !== newIdx) {  // order changed
                    item = scope.items.splice(oldIndex, 1)[0];
                    scope.items.splice(newIdx, 0, item);
                    scope.$apply();
                    scope.orderChangedCallback();
                }
            });
        };

        // directive's linking function
        var linkFunction = function (scope, element, attrs) {
            $rootElement = element;

            scope.$watchCollection('items', function (newItems, oldItems) {
                var children = $rootElement.children(),
                    diff = _.difference(newItems, oldItems);

                angular.forEach(children, function (el, i) {
                    // only set event handlers for new elements in collection
                    if (_.indexOf(diff, newItems[i]) > -1) {
                        setEventHandlers($(el));
                    }
                });
            });

            setContainerEventHandlers($rootElement, scope);
        };

        return {
            restrict: 'A',
            scope: {
                items: '=',
                orderChangedCallback: '&onOrderChanged'
            },
            link: linkFunction
        };
    }
]);