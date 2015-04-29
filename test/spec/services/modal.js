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

    /* after a change in the modal service, these tests are
     * practically unuseful. in order to make them useful again, the
     * DOM should be mocked providing the elements necessary for the
     * markup */
    it('is initially hidden', function () {
        expect(Modal.visible).toBe(false);
    });

    describe('show view locator', function() {
        beforeEach(inject(function($templateCache) {
            /*
            $httpBackend
                .expectGET('test-locator.html')
                .respond('<test></test>');
                */
            Modal.show({
                templateUrl: 'test-locator.html'
            });
            /*
            $httpBackend.flush();
            */
        }));

        it('updates its visibility', function() {
            expect(Modal.visible).toBe(true);
        });

        it('checks if modal class is set to large by default', function() {
            expect(Modal.windowClass).toEqual('large');
        });

        it('sets custom modal class', function() {
            Modal.show({
                templateUrl: 'test-locator.html',
                windowClass: 'small'
            });

            expect(Modal.windowClass).toEqual('small');
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

                it('updates its visibility', function() {
                    expect(Modal.visible).toBe(true);
                });
            });
        });
    });
});
