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

    var rootNode,
        scope;

    beforeEach(inject(function ($rootScope, $compile) {
        var html;

        scope = $rootScope.$new();
        scope.items = [];

        html = [
            '<div id="list" drag-sort items="items">',
              '<div ng-repeat="item in items" id="item_{{item.id}}">',
                'item {{item.id}}',
              '</div>',
            '</div>'
        ].join('');

        rootNode = $compile(html)(scope);
        scope.$digest();
    }));

    it('creates draggable DOM children for new items in collection',
        function () {
            var children = rootNode.children();
            expect(children.length).toEqual(0);

            scope.items.push({id: 1}, {id: 2});
            scope.$digest();

            children = rootNode.children();
            expect(children.length).toEqual(2);

            angular.forEach(children, function (el) {
                var $el = angular.element(el);
                expect($el.attr('draggable')).toEqual('true');
            });
        }
    );

});
