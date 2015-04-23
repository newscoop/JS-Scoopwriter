'use strict';

/**
* Module with tests for the droppedImage directive.
*
* @module droppedImage directive tests
*/

describe('Directive: droppedImage', function () {
    var fakeCtrl,  // mocked directive's controller
        initDeferred,
        $element,
        $root,
        scope,
        elementIsoScope,
        templates;

    beforeEach(module(
        'authoringEnvironmentApp', 'app/views/dropped-image.html'
    ));

    beforeEach(inject(
        function (
            $rootScope,
            $templateCache,
            $compile,
            $q,
            droppedImageDirective
        ) {
            var directive = droppedImageDirective[0],
                html,
                initDeferred = $q.defer();

            // for some reason jQuery in test does not have this extension,
            // thus we have to mock it here
            $.fn.extend({
                mutate: jasmine.createSpy()
            });

            // assign the template to the expected url called by the
            // directive (so that the directive can find it upon reques)
            templates = {
                dropped: $templateCache.get('app/views/dropped-image.html')
            };
            $templateCache.put('views/dropped-image.html', templates.dropped);

            // provide a fake controller to the directive
            directive.controller = function () {
               this.init = jasmine.createSpy().andReturn(initDeferred.promise);
               this.imageRemoved = jasmine.createSpy();
               fakeCtrl = this;  // save reference to the fake controller
            };

            // compile the directive
            // NOTE: aloha-block needs to be wrapped into extra wrapper, so
            // that it can be actually removed from DOM - if it is root node,
            // the .remove() call on it does not work for some reason, causing
            // the corresponding test to fail
            html = [
                '<div id="wrapper" dropped-images-container>',
                  '<div id="aloha-block">',
                    '<div dropped-image ',
                         'data-image-articleimageid="4"></div>',
                  '</div>',
                '</div>'
            ].join('');

            scope = $rootScope.$new();
            $root = $compile(html)(scope);
            scope.$digest();

            $root = $($root[0]);  // make it a "true jQuery" object
            $element = $root.find('[dropped-image]');

            elementIsoScope = angular.element($element[0]).isolateScope();
        }
    ));

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

    it('triggers controller initialization with correct articleImage ID',
        function () {
            expect(fakeCtrl.init.callCount).toEqual(1);
            expect(fakeCtrl.init).toHaveBeenCalledWith(4);
        }
    );

    describe('onCaptionClick', function () {
        var evClick,
            stopPropigationSpy,
            $button;

        beforeEach(function () {
            elementIsoScope.image = {id: 567};

            $button = $element.find('.caption');
            evClick = createEventMock('click');
            stopPropigationSpy = spyOn(evClick, 'stopPropagation');
        });

        it('stops default browser propigation', function () {
            $button.trigger(evClick);
            expect(stopPropigationSpy).toHaveBeenCalled();
        });
    });

    describe('the Close button\'s onClick handler', function () {
        var evClick,
            $button;

        beforeEach(function () {
            elementIsoScope.image = {id: 567};

            $button = $element.find('.close');
            evClick = createEventMock('click');
            spyOn(evClick, 'stopPropagation');
        });

        it('removes the element itself', function () {
            var $node;
            $button.triggerHandler(evClick);
            $node = $root.find('[dropped-image]');
            expect($node.length).toEqual(0);
        });

        it('notifies controller about the element removal', function () {
            $button.triggerHandler(evClick);
            expect(fakeCtrl.imageRemoved).toHaveBeenCalledWith(567);
        });
    });

});
