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

            // assign the template to the expected url called by the
            // directive (so that the directive can find it upon reques)
            templates = {
                dropped: $templateCache.get('app/views/dropped-image.html')
            };
            $templateCache.put('views/dropped-image.html', templates.dropped);

            // provide a fake controller to the directive
            directive.controller = function () {
               this.init = jasmine.createSpy();
               fakeCtrl = this;  // save reference to the fake controller
            };

            // compile the directive
            html = '<div dropped-image data-id="4"></div>';
            scope = $rootScope.$new();
            $element = $compile(html)(scope);
            $element = $($element[0]);  // make it a "true jQuery" object
            scope.$digest();
        }
    ));

    it('triggers controller initialization with correct image ID',
        function () {
            console.log('directive trigger test.......');
            expect(fakeCtrl.init.callCount).toEqual(1);
            expect(fakeCtrl.init).toHaveBeenCalledWith(4);
        }
    );

});
