'use strict';

describe('Service: panes', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var panes, p;
    beforeEach(inject(function (_panes_) {
        panes = _panes_;
        p = panes.query();
    }));

    it('should tell the layout', function () {
        expect(p.layout).toEqual({
            left: null,
            right: null
        });
    });
    describe('activated a pane', function() {
        beforeEach(function() {
            panes.visible(p[5]);
        });
        it('should tell the layout', function() {
            expect(p.layout).toEqual({
                left: 'small',
                right: null
            });
        });
        it('should tell the article class', function() {
            expect(p.articleClass).toEqual('shrink-left ');
        });
        describe('activated a pane on the opposite side', function() {
            beforeEach(function() {
                panes.visible(p[2]);
            });
            it('should tell the layout', function() {
                expect(p.layout).toEqual({
                    right: 'small',
                    left: null
                });
            });
            it('should tell the article class', function() {
                expect(p.articleClass).toMatch('shrink-right');
            });
            describe('activated a wider pane', function() {
                beforeEach(function() {
                    panes.visible(p[8]);
                });
                it('should tell the layout', function() {
                    expect(p.layout).toEqual({
                        right: null,
                        left: 'big'
                    });
                });
                it('should tell the article class', function() {
                    expect(p.articleClass).toMatch('shrink-left-more');
                    expect(p.articleClass).not.toMatch('shrink-left\b');
                });
            });
        });
    });
});
