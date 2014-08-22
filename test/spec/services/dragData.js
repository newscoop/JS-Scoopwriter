'use strict';

/**
* Module with tests for the Dragdata service.
*
* @module Dragdata service tests
*/
describe('Service: Dragdata', function () {

    /* convenience function to parse strings for comparison, because
     * also the same JSON object may generate two different strings when
     * serialised */
    var p = function(s) { return JSON.parse(s); };

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    // instantiate service
    var Dragdata;

    beforeEach(inject(function (_Dragdata_) {
        Dragdata = _Dragdata_;
    }));

    it('should have a list of available types', function () {
        expect(Dragdata.available()).toEqual(['test', 'image', 'embed']);
    });

    describe('converters', function () {
        var $el;
        beforeEach(function () {
            $el = $('<div data-id="42" data-width="250"></div>');
        });

        describe('test', function () {
            it('returns an empty object', function () {
                var returned = Dragdata.converters.test($el);
                expect(returned).toEqual({});
            });
        });

        describe('image', function () {
            it('returns an object with ID and width attributes', function () {
                var returned = Dragdata.converters.image($el);
                expect(returned).toEqual({id: '42', width: '250'});
            });
        });

        describe('embed', function () {
            it('returns an object with the ID attribute', function () {
                var returned = Dragdata.converters.embed($el);
                expect(returned).toEqual({id: '42'});
            });
        });
    });

    describe('checkDraggable() method', function () {
        it('returns an error if the element is missing the ' +
            'data-draggable-type attribute',
            function () {
                var $el = $('<div></div>'),
                    returned;
                returned = Dragdata.checkDraggable($el);
                expect(returned).toEqual(
                    'error: a draggable element has not a ' +
                    'data-draggable-type attribute'
                );
            }
        );

        it('returns an error if the element has an unknown value of the ' +
            'data-draggable-type attribute',
            function () {
                var $el = $('<div data-draggable-type="foo"></div>'),
                    returned;
                returned = Dragdata.checkDraggable($el);
                expect(returned).toEqual(
                    'error: draggable type "foo" is not supported');
            }
        );

        it('returns false if the element has a known value of the ' +
            'data-draggable-type attribute',
            function () {
                var $el = $('<div data-draggable-type="embed"></div>'),
                    returned;
                returned = Dragdata.checkDraggable($el);
                expect(returned).toBe(false);
            }
        );
    });

    // XXX: the following tests should be grouped by methods we test, not by
    // "usage scenarios" (by element type) - these are unit tests after all

    /* the test type is for higher level tests that rely on this
     * service, like in the droppable directive */
    describe('for the test type', function () {
        var data;
        beforeEach(function () {
            // expected intermediate data
            data = JSON.stringify({type: 'test'});
        });
        it('returns a whole element to be attached to the editable', function () {
            var $r = Dragdata.getDropped(data);
            expect($r.is('div')).toBe(true);
            expect($r.text()).toBe('test dropped');
        });
    });

    describe('for the image type', function () {
        var $i, data;
        beforeEach(function () {
            // initial element
            $i = $('<img>').attr({
                'data-draggable-type': 'image',
                'data-id': '3'
            });
            // expected intermediate data
            data = JSON.stringify({
                type: 'image',
                id: '3'
            });
        });
        it('finds no error', function () {
            expect(Dragdata.checkDraggable($i)).toBe(false);
        });
        it('creates a data transfer object from an image', function () {
            var d = Dragdata.getData($i);
            expect(p(d)).toEqual(p(data));
        });
        it('returns a whole element to be attached to the editable', function () {
            var $r = Dragdata.getDropped(data);
            expect($r[0].outerHTML).toEqual('<div></div>');
            expect($r.data()).toEqual({id: '3'});
        });
    });

    describe('for the embed type', function () {
        var $el, data;
        beforeEach(function() {
            // initial element
            $el = $('<div>').attr({
                'data-draggable-type': 'embed',
                'data-id': '5'
            });
            // expected intermediate data
            data = JSON.stringify({type: 'embed', id: '5'});
        });

        it('creates a data transfer object from an embed', function () {
            var d = Dragdata.getData($el);
            expect(p(d)).toEqual(p(data));
        });

        it('returns a whole element to be attached to the editable',
            function () {
                var $r = Dragdata.getDropped(data);

                expect($r[0].outerHTML).toEqual([
                    '<div class="snippet">',
                        '<dropped-snippet data-snippet-id="5">',
                        '</dropped-snippet>',
                    '</div>'
                ].join(''));

                expect($r.data()).toEqual({id: '5'});
            }
        );
    });

    describe('getDropped() method', function () {
        it('logs an error message for an unknown type', inject(function($log) {
            var data = JSON.stringify({type: 'foo'});
            spyOn($log, 'debug');

            Dragdata.getDropped(data);

            expect($log.debug).toHaveBeenCalledWith(
                'getDropped function called on a malformed data object, ' +
                'no known type into it'
            );
        }));
    });
});
