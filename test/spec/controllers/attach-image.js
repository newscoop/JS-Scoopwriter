'use strict';

/**
* Module with tests for the attach image controller.
*
* @module AttachImageCtrl controller tests
*/

describe('Controller: AttachImageCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var AttachImageCtrl,
        images,
        modal,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, _images_, _modal_) {
        scope = $rootScope.$new();
        images = _images_;
        modal = _modal_;

        AttachImageCtrl = $controller('AttachImageCtrl', {
            $scope: scope
        });
    }));

    it('sets API root URL in scope', function () {
        expect(scope.root).toEqual('http://newscoop.aes.sourcefabric.net');
    });

    it('proxies images', function () {
        expect(scope.images).toBeDefined();
    });

    it('has the "archive" source selected by default', function () {
        expect(scope.selected).toEqual({
            value : 'archive',
            url : 'views/attach-image/archive.html',
            description : 'From Media Archive'
        });
    });

    describe('scope\'s select() method', function () {
        it('sets given source as the new selected source', function () {
            var newSelected = {
                value: 'foo',
                url: 'views/bar.html',
                description: 'Some image source'
            };
            scope.select(newSelected);
            expect(scope.selected).toEqual(newSelected);
        });
    });

    describe('scope\'s attachCollected() method', function () {
        beforeEach(function () {
            spyOn(images, 'attachAllCollected');
            spyOn(images, 'discardAll');
            spyOn(modal, 'hide');
        });

        it('triggers attaching all images currently in basket', function () {
            scope.attachCollected();
            expect(images.attachAllCollected).toHaveBeenCalled();
        });

        it('triggers clearing the basket and upload list', function () {
            scope.attachCollected();
            expect(images.discardAll).toHaveBeenCalled();
        });

        it('closes the modal', function () {
            scope.attachCollected();
            expect(modal.hide).toHaveBeenCalled();
        });
    });

    describe('scope\'s discardChanges() method', function () {
        var eventObj;

        beforeEach(function () {
            spyOn(images, 'discardAll');
            spyOn(modal, 'hide');
            eventObj = {
                preventDefault: function () {},
                stopPropagation: function () {}
            };
        });

        it('triggers discarding all the changes', function () {
            scope.discardChanges(eventObj);
            expect(images.discardAll).toHaveBeenCalled();
        });

        it('closes the modal', function () {
            scope.discardChanges(eventObj);
            expect(modal.hide).toHaveBeenCalled();
        });
    });

});
