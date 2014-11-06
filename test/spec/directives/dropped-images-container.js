'use strict';

/**
* Module with tests for the droppedImagesContainer directive.
*
* @module droppedImagesContainer directive tests
*/

describe('Directive: droppedImagesContainer', function () {
    var scope,
        element,
        $rootScope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_$rootScope_, $compile) {
        var html = [
            '<div id="wrapper" dropped-images-container>',
            '  <div id="toolbar0"></div>',
            '  <div id="toolbar1"></div>',
            '  <div id="toolbar2"></div>',
            '/div>'
        ].join('');

        $rootScope = _$rootScope_;

        scope = $rootScope.$new();
        element = $compile(html)(scope);
    }));

    describe('directive\'s controller', function () {
        var ctrl,
            toolbars;

        beforeEach(function () {
            var $element = $(element);

            ctrl = element.controller('droppedImagesContainer');

            toolbars = [];
            toolbars.push($element.find('#toolbar0'));
            toolbars.push($element.find('#toolbar1'));
            toolbars.push($element.find('#toolbar2'));
        });

        it('hides all toolbars when an editable is deactivated', function () {
            // make sure that controller knows about toolbars and that
            // some of them are visible
            toolbars.forEach(function ($item) {
                ctrl.toggleToolbar($item);
            });
            toolbars[0].show();
            toolbars[2].show();

            $rootScope.$broadcast('texteditor-editable-deactivated');

            toolbars.forEach(function ($item) {
                expect($item.css('display')).toEqual('none');
            });
        });

        describe('toggleToolbar() method', function () {
            beforeEach(function () {
                // make sure that controller knows about the toolbars
                toolbars.forEach(function ($item) {
                    ctrl.toggleToolbar($item);
                });

                toolbars.forEach(function ($item) {
                   $item.hide();
                });
            });

            it('makes a visible toolbar hidden', function () {
                toolbars[1].show();
                ctrl.toggleToolbar(toolbars[1]);
                expect(toolbars[1].css('display')).toEqual('none');
            });

            it('makes a hidden toolbar (exclusively) visible', function () {
                toolbars[0].show();
                toolbars[2].show();

                ctrl.toggleToolbar(toolbars[1]);

                expect(toolbars[1].css('display')).toEqual('block');
                expect(toolbars[0].css('display')).toEqual('none');
                expect(toolbars[2].css('display')).toEqual('none');
            });
        });

        describe('deregisterToolbar() method', function () {
            beforeEach(function () {
                // make sure that controller knows about the toolbars
                toolbars.forEach(function ($item) {
                    ctrl.toggleToolbar($item);
                });

                toolbars.forEach(function ($item) {
                   $item.hide();
                });
            });

            it('stops tracking a toolbar', function () {
                toolbars[1].show();

                 ctrl.deregisterToolbar(toolbars[1]);
                 ctrl.toggleToolbar(toolbars[0]);

                 // deregistered toolbar does not get hidden
                 expect(toolbars[1].css('display')).toEqual('block');
            });
        });
    });

});
