'use strict';

describe('Directive: droppedImage', function () {

    // load the directive's module
    beforeEach(module(
        'authoringEnvironmentApp',
        'app/views/dropped-image.html',
        'app/views/popover-image.html'
    ));

    var element,
    scope,
    templates;

    beforeEach(inject(function ($rootScope, $templateCache, $compile) {
        // assign the template to the expected url called by the
        // directive and put it in the cache
        templates = {
            dropped: $templateCache.get('app/views/dropped-image.html'),
            popover: $templateCache.get('app/views/popover-image.html')
        };
        $templateCache.put('views/dropped-image.html', templates.dropped);
        $templateCache.put('views/popover-image.html', templates.popover);

        scope = $rootScope.$new();
        scope.get = function() {
            scope.basename = 'image.jpg';
            scope.style = {
                width: '200px'
            };
            return 64;
        };
        scope.images = {
            include: function() {},
            exclude: jasmine.createSpy('images exclude')
        };
        scope.select = jasmine.createSpy();
        spyOn(scope, 'get').andCallThrough();
        element = angular
            .element('<div dropped-image ng-style="style.container" data-id="4"></div>');
        element = $compile(element)(scope);
        scope.$digest();
    }));

    it('finds valid popover template in the cache', function() {
        expect(templates.popover).toBeTruthy();
    });
    it('finds valid dropped template in the cache', function() {
        expect(templates.dropped).toBeTruthy();
    });
    xit('gets the image', inject(function($compile) {
        expect(scope.get).toHaveBeenCalledWith('4');
    }));
    describe('the image element', function() {
        var $i;
        beforeEach(function() {
            $i = $(element).find('img');
        });
        it('is one', function() {
            expect($i.size()).toBe(1);
        });
        it('has the right src', function() {
            expect($i.attr('src')).toBe('/images/');
        });
    });
    describe('on click', function() {
        beforeEach(function() {
            $(element).click();
        });
        xit('shows the popover', function() {
            expect(scope.select).toHaveBeenCalledWith(64);
        });
    });
    describe('on remove', function() {
        beforeEach(function() {
            $(element).find('.close').click();
        });
        xit('excludes the image from the article', function() {
            expect(scope.images.exclude).toHaveBeenCalledWith('4');
        });
    });
});
