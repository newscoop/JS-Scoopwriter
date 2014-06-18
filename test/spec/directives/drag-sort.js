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

        html = '<div id="list" drag-sort items="items"></div>';

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
            dataTransfer: {},
            preventDefault: function () {},
            stopPropagation: function () {},
        };
        return ev;
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


    describe('root node\'s event handlers', function () {

        describe('dragover', function () {
            var ev;

            beforeEach(function () {
                ev = createEventMock('dragover');
            });

            it('enables drop on the element itself', function () {
                spyOn(ev.originalEvent, 'preventDefault');
                $rootNode.trigger(ev);
                expect(ev.originalEvent.preventDefault).toHaveBeenCalled();
            });

            it('sets drop effect to "move"', function () {
                $rootNode.trigger(ev);
                expect(
                    ev.originalEvent.dataTransfer.dropEffect).toEqual('move');
            });
        });

        describe('dragenter', function () {
            var ev;

            beforeEach(function () {
                ev = createEventMock('dragenter');
            });

            it('enables drop on the element itself (for IE)', function () {
                spyOn(ev.originalEvent, 'preventDefault');
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
            // TODO: prevents default browser action (calls preventDefault)

            // TODO: prevents further event bubbling

            // TODO: invokes callback if there is a change etc.
        });
    });

});
