'use strict';

/**
* Module with tests for the Toolbar controller.
*
* @module ToolbarCtrl controller tests
*/
describe('Controller: ToolbarCtrl', function () {

    beforeEach(module('authoringEnvironmentApp'));

    var ToolbarCtrl,
        scope,
        $timeout,
        $rootScope;

    beforeEach(inject(function ($controller, _$rootScope_, _$timeout_) {
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        scope = $rootScope.$new();
        ToolbarCtrl = $controller('ToolbarCtrl', {
            $scope: scope
        });
    }));
        
    it('initializes stylers', function () {
        expect(scope.stylers).not.toEqual([]);
    });

    it('sets p as the current active style', function () {
        expect(scope.active).toEqual('Normal Text');
    });

    it('calls updateScope() on texteditor-selection-changed', function () {
        var updateScopeSpy = spyOn(scope, 'updateScope');
        $rootScope.$emit('texteditor-selection-changed');

        expect(scope.active).toEqual('Normal Text');
    });

    it('calls updateScope() on texteditor-command-executed', function () {
        var updateScopeSpy = spyOn(scope, 'updateScope');
        $rootScope.$emit('texteditor-command-executed');

        expect(scope.active).toEqual('Normal Text');
    });
    
    describe('scope\'s updateScope() method', function () { 

        it('set the active style correctly when not blockquote', function() {
            var commandValue = 'p';
            var queryCommandValueSpy = spyOn(Aloha, 'queryCommandValue').andReturn(commandValue);
            scope.active = 'Heading 2';
            scope.updateScope();
            $timeout.flush();
 
            expect(queryCommandValueSpy).toHaveBeenCalled();
            expect(scope.active).toEqual('Normal Text');
        });

        it('set the active style correctly when blockquote', function() {
            var commandValue = '';
            var queryCommandValueSpy = spyOn(Aloha, 'queryCommandValue').andReturn(commandValue);

            Aloha.blockquoteFound = true;
            scope.active = 'Heading 2';
            scope.updateScope();
            $timeout.flush();
 
            expect(queryCommandValueSpy).toHaveBeenCalled();
            expect(scope.active).toEqual('Blockquote');
        });
    });
});
