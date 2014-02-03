'use strict';

describe('Directive: droppedImage', function () {

    // load the directive's module
    beforeEach(module(
        'authoringEnvironmentApp',
        'app/views/dropped-image.html'
    ));

    var element,
    scope;

    beforeEach(inject(function ($rootScope, $templateCache, $compile) {
        // assign the template to the expected url called by the
        // directive and put it in the cache
        var templates = {
            image: $templateCache.get('app/views/dropped-image.html'),
            popover: $templateCache.get('app/views/popover-image.html')
        };
        $templateCache.put('views/dropped-image.html', templates.image);
        $templateCache.put('views/popover-image.html', templates.popover);

        scope = $rootScope.$new();
        scope.get = function() {
            scope.basename = 'image.jpg';
            scope.style = {
                width: '200px'
            };
        };
        scope.images = {
            include: function() {},
            exclude: function() {}
        };
        spyOn(scope, 'get').andCallThrough();
        element = angular
            .element('<div dropped-image ng-style="style.container" data-id="4"></div>');
        element = $compile(element)(scope);
        scope.$digest();
    }));

    xit('gets the image', function() {
        expect(scope.get).toHaveBeenCalledWith('4');
    });
    xit('renders the image', inject(function () {
        var $i = $(element).find('img');
        expect($i.size()).toBe(1);
        expect($i.attr('src')).toBe('images/image.jpg');
    }));
    xit('sets the style', function() {
        expect($(element).attr('ng-style')).toBe('style');
        expect($(element).attr('style')).toBe('width: 200px;');
    });
    describe('on click', function() {
        beforeEach(function() {
            $(element).click();
        });
        xit('shows the popover', function() {
            expect($(element).find('.popover').size()).toBe(1);
        });
    });
});
