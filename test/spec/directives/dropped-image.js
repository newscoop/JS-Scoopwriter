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
        //assign the template to the expected url called by the directive and put it in the cache
        var template = $templateCache.get('app/views/dropped-image.html');
        $templateCache.put('views/dropped-image.html',template);

        scope = $rootScope.$new();
        scope.get = function() {
            scope.basename = 'image.jpg';
            scope.style = {
                width: '200px'
            };
        };
        spyOn(scope, 'get').andCallThrough();
        element = angular
            .element('<div dropped-image ng-style="style" data-id="4"></div>');
        element = $compile(element)(scope);
        scope.$digest();
    }));

    it('gets the image', function() {
        expect(scope.get).toHaveBeenCalledWith('4');
    });
    it('renders the image', inject(function () {
        var $i = $(element).find('img');
        expect($i.size()).toBe(1);
        expect($i.attr('src')).toBe('images/image.jpg');
    }));
    it('sets the style', function() {
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
