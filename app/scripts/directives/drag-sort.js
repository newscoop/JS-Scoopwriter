'use strict';

/**
* A directive which enables changing the order of container's children by
* drag and drop operations.
*
* @class dragSort
*/

angular.module('authoringEnvironmentApp').directive('dragSort', [
    function () {

        var newIdx = -1,  // new element position
            $emptySlot = null,
            $rootElement, // reference to root DOM div where directive applied
            draggedElementIdx = -1;

        // TODO: rename? bascially we attach some behavior on item
        var setElementHandlers = function ($element, dataItem) {
            $element.attr('draggable', true);

            $element.on('dragstart', function (e) {
                $rootElement.children().each(function (i, child) {
                    $(child).attr('data-sort-index', i);
                });

                var dragData = {
                    sortIndex: parseInt($element.attr('data-sort-index'), 10)
                };

                draggedElementIdx = dragData.sortIndex;

                console.log('dragstart', dragData);  // TODO: remove
                e.originalEvent.dataTransfer.setData(
                    'text/plain', JSON.stringify(dragData));
                // TODO: application/json? bo delalo v drop?

                e.originalEvent.dataTransfer.effectAllowed = 'move';

                $element.addClass('dragged');
            });

            $element.on('dragend', function (e) {
                // cleanup ...
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
                var elementHeight,
                    dropIdx,
                    posY,
                    $child,
                    sortIdx = parseInt($element.attr('data-sort-index'), 10);
                // dragData not accessible (security), only on drop...

                e.originalEvent.preventDefault();  // allow drop
                e.originalEvent.dataTransfer.dropEffect = 'move';

                if (e.offsetY === undefined) {  // Firefox
                    // or is it clientY? verjetno pageY (relative to document)
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

                // if new element index different from current one,
                // update it and add DOM placeholder (for the gap)
                if (dropIdx !== newIdx) {

                    newIdx = dropIdx;

                    // append empty slot before the child at newIdx
                    // if no child (last index), amppend to the end
                    if ($emptySlot) {
                        $emptySlot.remove();
                    }

                    // prevent showing newitemslot right before or after the
                    // dragged element itself (would make no sense, dropping
                    // there wpuld not change the order)
                    if (newIdx === draggedElementIdx ||
                        newIdx === draggedElementIdx + 1
                    ) {
                        // console.log('not doing anything, dropSlot too close');
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
                // just let the drop even through to the parent container
                e.preventDefault();
            });

        };

        var setRootElementHandlers = function ($rootElement, scope) {
            $rootElement.on('dragover', function (e) {
                e.originalEvent.preventDefault();  // allow drop on container
                e.originalEvent.dataTransfer.dropEffect = 'move';
            });

            $rootElement.on('dragenter', function (e) {
                e.originalEvent.preventDefault();  // allow drop on container
                e.originalEvent.dataTransfer.dropEffect = 'move';
            });

            $rootElement.on('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var dragData = e.originalEvent.dataTransfer.getData('Text');
                dragData = JSON.parse(dragData);
                //console.log('rootElement drop, dragData:', dragData);

                var oldIndex = dragData.sortIndex;

                // TODO: index correction by -1 if higher that original!
                if (newIdx > oldIndex) {
                    newIdx -= 1;  // correction for the dragged element itself
                }

                if (oldIndex !== newIdx) {
                    console.log('moving element from', oldIndex, 'to', newIdx);

                    var item = scope.items[oldIndex];
                    scope.items.splice(oldIndex, 1);
                    scope.items.splice(newIdx, 0, item);

                    scope.$apply();
                } else {
                    console.log('no change, nothing to swap');
                }
            });
        };

        var linkFunction = function (scope, element, attrs) {
            $rootElement = element;

            scope.$watchCollection('items', function (newItems, oldItems) {
                // TODO: make sure not to set duplicate handlers!
                // only set handlers on new elements, not all!
                $rootElement.children().each(function (i, el) {
                    setElementHandlers($(el), newItems[i]);
                });

                console.log('children:', $rootElement.children().length);
                console.log('array elements:', newItems.length);
            });

            setRootElementHandlers($rootElement, scope);
        };

        return {
            restrict: 'A',
            scope: {
                items: '='
            },
            link: linkFunction
        };
    }
]);