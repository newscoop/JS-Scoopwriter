'use strict';

describe('Directive: sfDroppable', function () {

    // load the directive's module
    beforeEach(module('authoringEnvironmentApp'));

    var scope,
        $rootNode,
        $p;

    beforeEach(inject(function ($rootScope, $compile) {
        var html = [
            '<div class="angular-aloha-element2 aloha-editable" ',
            'contenteditable="true" sf-droppable>',
            '<p>hey Joe</p></div>'].join('');

        scope = $rootScope.$new();
        $rootNode = $compile(html)(scope);
        $rootNode = $($rootNode[0]);  // make it a "true jQuery" object
        scope.$digest();
        $p = $rootNode.find('p');
    }));

    /**
    * Creates a new mocked event object that can be used as an argument to
    * event handlers.
    *
    * @function createEventMock
    * @param eventType {String} type of event (e.g. 'dragover')
    * @return {Object} new mocked event instance
    */
    function createEventMock(eventType) {
        var ev = $.Event(eventType);
        ev.originalEvent = {
            preventDefault: jasmine.createSpy(),
            stopPropagation: jasmine.createSpy(),
            dataTransfer: {}
        };
        return ev;
    }

    function addNewImageBlock(id) {
    }

    function addNewSnippetBlock(id) {
    }

    it('appends an element on drop', function () {
        var evDrop = createEventMock('drop');

        evDrop.originalEvent.dataTransfer = {
            getData: function() {
                return JSON.stringify({
                    type: 'test'
                });
            }
        };
        $p.trigger(evDrop);
        var dropped = $p.next();
        expect(dropped.text()).toBe('test dropped');
    });

    describe('onDragEnter', function () {
        var evDragEnter,
            evDragLeave,
            $children;

        beforeEach(function () {
            evDragEnter = createEventMock('dragenter'); 
            evDragEnter.originalEvent.dataTransfer = {
                setData: jasmine.createSpy(),
                getData: jasmine.createSpy()
            };
            evDragLeave = createEventMock('dragleave'); 
            evDragLeave.originalEvent.dataTransfer = {
                setData: jasmine.createSpy(),
                getData: jasmine.createSpy()
            };
        });

        it('creates placeholder slot before element', function () {
            $p.trigger(evDragEnter);
            $children = $rootNode.children(); 
            expect($($children[0]).hasClass('drag-drop-placeholder')).toBe(true);

            $($children[0]).trigger(evDragEnter);
            expect($($children[0]).hasClass('drag-over')).toBe(true);

            $($children[0]).trigger(evDragLeave);
            expect($($children[0]).hasClass('drag-over')).toBe(false);
        });

    });

    describe('onDragOver', function () {
        var evDragOver,
            $children;

        beforeEach(function () {
            evDragOver = createEventMock('dragover'); 
            evDragOver.originalEvent.dataTransfer = {
                setData: jasmine.createSpy(),
                getData: jasmine.createSpy()
            };
        });

        it('creates placeholder slot after element', function () {
            $p.trigger(evDragOver);
            $children = $rootNode.children(); 
            expect($($children[1]).hasClass('drag-drop-placeholder')).toBe(true);
        });
    });

    describe('onDragLeave', function () {
        var evDragLeave,
            evDragEnter,
            $children;

        beforeEach(function () {
            evDragLeave = createEventMock('dragleave'); 
            evDragLeave.originalEvent.dataTransfer = {
                setData: jasmine.createSpy(),
                getData: jasmine.createSpy()
            };
            evDragEnter = createEventMock('dragenter'); 
            evDragEnter.originalEvent.dataTransfer = {
                setData: jasmine.createSpy(),
                getData: jasmine.createSpy()
            };
        });

        it('removes placeholder slot', function () {
            $p.trigger(evDragEnter);
            $p.trigger(evDragLeave);
            $children = $rootNode.children(); 
            expect($children.filter('.drag-drop-placeholder').length).toBe(0);

        });
    });

    describe('onDrop', function () {
        var evDrop;

        beforeEach(function () {
            evDrop = createEventMock('drop'); 
            evDrop.originalEvent.dataTransfer = {
                setData: jasmine.createSpy(),
                getData: jasmine.createSpy()
            };
        });

        it('prevents browser\'s default behavior', function () {
            $p.trigger(evDrop);
            expect(evDrop.originalEvent.preventDefault).toHaveBeenCalled();
        });

        it('calls stop propigation', function () {
            $p.trigger(evDrop);
            expect(
                evDrop.originalEvent.stopPropagation).toHaveBeenCalled();
        });

        it('calls originalEvent.dataTransfer.getData', function () {
            $p.trigger(evDrop);
            expect(
                evDrop.originalEvent.dataTransfer.getData).toHaveBeenCalled();
        });

        it('triggers aloha-smart-content-changed event', function () {
            var alohaEditable = {
                activate: jasmine.createSpy(),
                getContents: jasmine.createSpy()
            };
            var alohaGetByIdSpy = spyOn(Aloha, 'getEditableById').andReturn(alohaEditable);
            var alohaTriggerSpy = spyOn(Aloha, 'trigger').andReturn(true);

            $p.trigger(evDrop);
            expect(alohaGetByIdSpy).toHaveBeenCalled();
            expect(alohaTriggerSpy).toHaveBeenCalled();
        });

    });
});
