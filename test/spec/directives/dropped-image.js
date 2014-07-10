'use strict';

/**
* Module with tests for the droppedImage directive.
*
* @module droppedImage directive tests
*/

describe('Directive: droppedImage', function () {
    var fakeCtrl,  // mocked directive's controller
        $element,
        scope,
        templates;

    beforeEach(module(
        'authoringEnvironmentApp', 'app/views/dropped-image.html'
    ));

    beforeEach(inject(
        function (
            $rootScope, $templateCache, $compile, droppedImageDirective
        ) {
            var directive = droppedImageDirective[0],
                html;

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
               this.init = jasmine.createSpy();
               this.imageRemoved = jasmine.createSpy();
               fakeCtrl = this;  // save reference to the fake controller
            };

            // compile the directive
            html = [
                '<div id="wrapper">',
                  '<div dropped-image data-image-id="4"></div>',
                '</div>'
            ].join('');

            scope = $rootScope.$new();
            $element = $compile(html)(scope);
            $element = $($element[0]);  // make it a "true jQuery" object
            scope.$digest();
        }
    ));

    it('triggers controller initialization with correct image ID',
        function () {
            expect(fakeCtrl.init.callCount).toEqual(1);
            expect(fakeCtrl.init).toHaveBeenCalledWith(4);
        }
    );

    describe('the Close button\'s onClick handler', function () {
        var ev,
            $button;

        beforeEach(function () {
            $button = $element.find('.close');
            ev = $.Event('click');
            spyOn(ev, 'stopPropagation');
        });

        it('prevents event propagation', function () {
            $button.triggerHandler(ev);
            expect(ev.stopPropagation).toHaveBeenCalled();
        });

        it('removes the element itself', function () {
            var $node;
            $button.triggerHandler(ev);
            $node = $element.find('[dropped-image]');
            expect($node.length).toEqual(0);
        });

        it('notifies controller about the element removal', function () {
            $button.triggerHandler(ev);
            expect(fakeCtrl.imageRemoved).toHaveBeenCalledWith(4);
        });
    });

});
