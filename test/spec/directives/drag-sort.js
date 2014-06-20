'use strict';

/**
* Module with tests for the directive that enables sorting the elements by
* dragging and dropping.
*
* @module dragSort directive tests
*/

describe('Directive: dragSort', function () {

    // load the directive's module
    beforeEach(module('authoringEnvironmentApp'));

    var scope,
        $rootNode;

    beforeEach(inject(function ($rootScope, $compile) {
        var html;

        scope = $rootScope.$new();
        scope.items = [];
        scope.orderChanged = jasmine.createSpy('scope.orderChanged');

        html = [
            '<div id="list" drag-sort items="items"',
                'on-order-changed="orderChanged()">',
            '</div>'
        ].join('');

        $rootNode = $compile(html)(scope);
        $rootNode = $($rootNode[0]);  // make it a "true jQuery" object
        scope.$digest();
    }));

    /**
    * Appends a new dummy item to the items list in scope and creates a
    * corresponding DOM child node (simulating what ng-repeat would do in a
    * real world).
    *
    * @function addNewItem
    * @param id {Number} new item's ID
    */
    function addNewItem (id) {
        var newNodeHtml = [
            '<div id="item_', id, '">',
                'item ', id,
            '</div>'
        ].join('')

        scope.items.push({id: id});
        $rootNode.append(newNodeHtml);
    }

    /**
    * Creates a new mocked event object that can be used as an argument to
    * event handlers.
    *
    * @function createEventMock
    * @param eventType {String} type of event (e.g. 'dragover')
    * @return {Object} new mocked event instance
    */
    function createEventMock (eventType) {
        var ev = $.Event(eventType);
        ev.originalEvent = {
            preventDefault: jasmine.createSpy(),
            stopPropagation: jasmine.createSpy()
        };
        return ev;
    }

    /**
    * Simulates dragover event over an item at the given index.
    *
    * @function dragOverItem
    * @param idx {Number} index of an item to drag over
    * @param topHalf {Boolean} if true, drag over the top half
    *   of the item, otherwise over the bottom half of it
    */
    function dragOverItem (idx, topHalf) {
        var evDragover,
            offsetY = topHalf ? 10 : 70,
            $item = $($rootNode.children()[idx]);

        // simulate dragging over the top half of the item (so that
        // the new desired postion of the dragged item becomes idx)
        evDragover = createEventMock('dragover');
        evDragover.originalEvent.dataTransfer = {};
        evDragover.originalEvent.offsetY = offsetY;

        $item.css('height', '100px');
        $item.triggerHandler(evDragover);
    }

    it('makes corresponding DOM elements draggable for new collection items',
        function () {
            var children = $rootNode.children();
            expect(children.length).toEqual(0);

            addNewItem(1);
            addNewItem(2);
            scope.$digest();

            children = $rootNode.children();

            angular.forEach(children, function (el) {
                expect(el.draggable).toBe(true);
            });
        }
    );

    it('does not initialize DOM elements again for existing items',
        function () {
            var oldNode;

            addNewItem(1);
            oldNode = $rootNode.children()[0];
            scope.$digest();

            oldNode.draggable = false;
            addNewItem(2);
            scope.$digest();

            expect(oldNode.draggable).toBe(false);  // not touched
        }
    );


    describe('collection items\' event handlers', function () {
        var $item;

        beforeEach(function () {
            [10, 20, 30, 40].forEach(function (id) {
                addNewItem(id);
            });
            scope.$digest();

            $item = $($rootNode.children()[2]);
        });

        describe('onDragStart', function () {
            var ev;  // event object mock

            beforeEach(function () {
                ev = createEventMock('dragstart');
                ev.originalEvent.dataTransfer = {
                    setData: jasmine.createSpy('dataTransfer.setData')
                };
            });

            it('sets correct event drag data', function () {
                $item.trigger(ev);
                expect(ev.originalEvent.dataTransfer.setData)
                    .toHaveBeenCalledWith('text/plain', '{"sortIndex":2}');
            });

            it('sets the drag-and-drop operation type to "move"', function () {
                $item.trigger(ev);
                expect(
                    ev.originalEvent.dataTransfer.effectAllowed
                ).toEqual('move');
            });

            it('sets "dragged" CSS class on the element', function () {
                $item.removeClass('dragged');
                $item.trigger(ev);
                expect($item.hasClass('dragged')).toBe(true);
            });
        });

        describe('onDragEnd', function () {
            var ev;  // event object mock

            beforeEach(function () {
                ev = createEventMock('dragend');
            });

            it('removes "dragged" CSS class from the element', function () {
                $item.addClass('dragged');
                $item.trigger(ev);
                expect($item.hasClass('dragged')).toBe(false);
            });

            it('removes the new item slot element', function () {
                var evDragStart = createEventMock('dragstart');
                evDragStart.originalEvent.dataTransfer = {
                    setData: function () {}
                };

                // we first start dragging the item so that the directive
                // know, which item is being dragged
                $item.triggerHandler(evDragStart);

                // set first child's sort index and simulate a drag over it
                // (so that the directive creates the slot element)
                $($rootNode.children()[0]).attr('data-sort-index', 0);
                dragOverItem(0, true);

                // now trigger dragEnd event and see what happens
                $item.trigger(ev);
                expect($rootNode.children('.new-item-slot').length).toEqual(0);
            });

            it('removes auxiliary data atribute from all items', function () {
                angular.forEach($rootNode.children(), function (el, i) {
                    $(el).attr('data-sort-index', i);
                });
                $item.trigger(ev);

                angular.forEach($rootNode.children(), function (el) {
                    expect($(el).attr('data-sort-index')).toBeUndefined();
                });
            });
        });

        describe('onDragEnter', function () {
            var ev;  // event object mock

            beforeEach(function () {
                ev = createEventMock('dragenter');
                ev.originalEvent.dataTransfer = {};
            });

            it('enables drop on the element itself (for IE)', function () {
                $item.trigger(ev);
                expect(ev.originalEvent.preventDefault).toHaveBeenCalled();
            });

            it('sets drop effect to "move" (for IE)', function () {
                $item.trigger(ev);
                expect(
                    ev.originalEvent.dataTransfer.dropEffect).toEqual('move');
            });
        });

        // TODO: dragover

        describe('onDrop', function () {
            var ev;  // event object mock

            beforeEach(function () {
                ev = createEventMock('drop');
            });

            it('prevents browser\'s default behavior', function () {
                $item.triggerHandler(ev);
                expect(ev.originalEvent.preventDefault).toHaveBeenCalled();
            });

            it('lets the event propagate to container', function () {
                $item.triggerHandler(ev);
                expect(
                    ev.originalEvent.stopPropagation).not.toHaveBeenCalled();
            });
        });
    });  // end describe('collection items\' event handlers')


    describe('root node\'s event handlers', function () {

        describe('onDragOver', function () {
            var ev;  // event object mock

            beforeEach(function () {
                ev = createEventMock('dragover');
                ev.originalEvent.dataTransfer = {};
            });

            it('enables drop on the element itself', function () {
                $rootNode.trigger(ev);
                expect(ev.originalEvent.preventDefault).toHaveBeenCalled();
            });

            it('sets drop effect to "move"', function () {
                $rootNode.trigger(ev);
                expect(
                    ev.originalEvent.dataTransfer.dropEffect).toEqual('move');
            });
        });

        describe('onDragEnter', function () {
            var ev;  // event object mock

            beforeEach(function () {
                ev = createEventMock('dragenter');
                ev.originalEvent.dataTransfer = {
                    setData: jasmine.createSpy(),
                    getData: jasmine.createSpy()
                };
            });

            it('enables drop on the element itself (for IE)', function () {
                $rootNode.trigger(ev);
                expect(ev.originalEvent.preventDefault).toHaveBeenCalled();
            });

            it('sets drop effect to "move" (for IE)', function () {
                $rootNode.trigger(ev);
                expect(
                    ev.originalEvent.dataTransfer.dropEffect).toEqual('move');
            });
        });

        describe('onDrop', function () {
            var evDrop;  // drop event object mock

            beforeEach(function () {
                var evDragStart,
                    $item2;

                evDrop = createEventMock('drop');
                evDrop.originalEvent.dataTransfer = {
                    effectAllowed: 'move',
                    setData: jasmine.createSpy(),
                    getData: jasmine.createSpy()
                };
                evDrop.originalEvent.dataTransfer.getData.andReturn(
                    '{"sortIndex": 2}'  // we drag around item 2
                );

                [0, 1, 2, 3, 4].forEach(function (id) {
                    addNewItem(id);
                });
                scope.$digest();

                // simulate dragging item id=2
                evDragStart = createEventMock('dragstart');
                evDragStart.originalEvent.dataTransfer = {
                    setData: jasmine.createSpy()
                };
                $item2 = $($rootNode.children()[2]);
                $item2.triggerHandler(evDragStart);
            });

            it('prevents browser\'s default behavior', function () {
                $rootNode.trigger(evDrop);
                expect(evDrop.originalEvent.preventDefault).toHaveBeenCalled();
            });

            it('prevents event propagation', function () {
                $rootNode.trigger(evDrop);
                expect(
                    evDrop.originalEvent.stopPropagation).toHaveBeenCalled();
            });

            describe('when items order should change', function () {
                it('correctly moves dragged item to a higher position',
                    function () {
                        // we move the item to a position with lower index
                        // than its current position
                        dragOverItem(1, true);  // just before item 1
                        $rootNode.trigger(evDrop);
                        expect(scope.items).toEqual([
                            {id: 0}, {id: 2}, {id: 1}, {id: 3}, {id: 4}
                        ]);
                    }
                );

                it('correctly moves dragged item to a lower position',
                    function () {
                        // we move the item to a position with higher index
                        // than its current position
                        dragOverItem(3, false);  // behind item 3
                        $rootNode.trigger(evDrop);
                        expect(scope.items).toEqual([
                            {id: 0}, {id: 1}, {id: 3}, {id: 2}, {id: 4}
                        ]);
                    }
                );

                it('invokes provided orderChanged callback', function () {
                    dragOverItem(4, false);  // behind item 4
                    $rootNode.trigger(evDrop);
                    expect(scope.orderChanged).toHaveBeenCalled();
                });
            });

            describe('when items order should *not* change', function () {
                beforeEach(function () {
                    dragOverItem(2, true);  // drag over itself
                });

                it('does not change the items list', function () {
                    $rootNode.trigger(evDrop);
                    expect(scope.items).toEqual([
                        {id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}
                    ]);
                });

                it('does not invoke provided orderChanged callback',
                    function () {
                        $rootNode.trigger(evDrop);
                        expect(scope.orderChanged).not.toHaveBeenCalled();
                    }
                );
            });

        });  // end describe('onDrop')
    });  // end describe('root node\'s event handlers')

});
