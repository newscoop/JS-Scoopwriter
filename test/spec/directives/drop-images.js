'use strict';

/**
* Module with tests for the directive that turns an element into image upload
* dropzone.
*
* @module dropImages directive tests
*/

describe('Directive: dropImages', function () {

    // load the directive's module
    beforeEach(module('authoringEnvironmentApp'));

    var scope,
        $root;

    beforeEach(inject(function ($rootScope, $compile) {
        var html;

        scope = $rootScope.$new();
        scope.addToUploadList = jasmine.createSpy('scope.addToUploadList');

        html = [
            '<div id="dropzone" drop-images handler="addToUploadList(files)">',
            '</div>',
        ].join('');

        $root = $compile(html)(scope);
        $root = $($root[0]);  // make it a "true jQuery" object
        scope.$digest();
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
            dataTransfer: {}
        };
        spyOn(ev, 'preventDefault');
        spyOn(ev, 'stopPropagation');

        return ev;
    }

    describe('onDragOver', function () {
        var ev;  // event object mock

        beforeEach(function () {
            ev = createEventMock('dragover');
        });

        it('enables drop on the element', function () {
            $root.triggerHandler(ev);
            expect(ev.preventDefault).toHaveBeenCalled();
        });

        it('prevents event propagation', function () {
            $root.triggerHandler(ev);
            expect(ev.stopPropagation).toHaveBeenCalled();
        });

        it('sets drop effect to "copy"', function () {
            $root.triggerHandler(ev);
            expect(
                ev.originalEvent.dataTransfer.dropEffect).toEqual('copy');
        });
    });


    describe('onDrop', function () {
        var fileListItems,
            ev;  // event object mock

        beforeEach(function () {
            ev = createEventMock('drop');
            ev.originalEvent.dataTransfer.files = {
                length: 0
            };
        });

        it('prevents browser\'s default behavior', function () {
            $root.triggerHandler(ev);
            expect(ev.preventDefault).toHaveBeenCalled();
        });

        it('prevents event propagation', function () {
            $root.trigger(ev);
            expect(ev.stopPropagation).toHaveBeenCalled();
        });

        it('invokes given handler with dropped image files', function () {
            var files = [
                {name: 'file_1', type: 'image/png'},
                {name: 'file_2', type: 'image/gif'},
                {name: 'file_3', type: 'image/jpeg'}
            ];

            ev.originalEvent.dataTransfer.files = {
                length: 3,
                item: function (i) {return files[i]}
            };

            $root.trigger(ev);

            expect(scope.addToUploadList).toHaveBeenCalledWith([
                {name: 'file_1', type: 'image/png'},
                {name: 'file_2', type: 'image/gif'},
                {name: 'file_3', type: 'image/jpeg'}
            ]);
        });

        it('filters out non-image files when invoking the handler',
            function () {
                var files = [
                    {name: 'file_1', type: 'image/png'},
                    {name: 'file_2', type: 'text/plain'},
                    {name: 'file_3', type: 'image/jpeg'},
                    {name: 'file_4', type: 'application/pdf'},
                ];

                ev.originalEvent.dataTransfer.files = {
                    length: 4,
                    item: function (i) {return files[i]}
                };

                $root.trigger(ev);

                expect(scope.addToUploadList).toHaveBeenCalledWith([
                    {name: 'file_1', type: 'image/png'},
                    {name: 'file_3', type: 'image/jpeg'}
                ]);
            }
        );
    });


});
