'use strict';

describe('Service: Modal', function () {

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var Modal, $httpBackend;
    beforeEach(inject(function (_modal_, _$httpBackend_) {
        Modal = _modal_;
        $httpBackend = _$httpBackend_;
    }));

    it('is initially hidden', function () {
        expect(Modal.visible).toBe(false);
    });
    describe('show view locator', function() {
        beforeEach(inject(function($templateCache) {
            $httpBackend
                .expectGET('test-locator.html')
                .respond('<test></test>');
            Modal.show({templateUrl: 'test-locator.html'});
            $httpBackend.flush();
        }));
        it('updates its content and visibility', function() {
            expect(Modal.html).toBe('<test></test>');
            expect(Modal.visible).toBe(true);
        });
        describe('hidden', function() {
            beforeEach(function() {
                Modal.hide();
            });
            it('hides', function() {
                expect(Modal.visible).toBe(false);
            });
            describe('opened again', function() {
                beforeEach(inject(function($templateCache) {
                    Modal.show({templateUrl: 'test-locator.html'});
                }));
                it('updates its content and visibility', function() {
                    expect(Modal.html).toBe('<test></test>');
                    expect(Modal.visible).toBe(true);
                });
            });
        });
    });

});
