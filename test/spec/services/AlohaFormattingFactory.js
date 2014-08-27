'use strict';

/**
* Module with tests for the AlohaFormattingFactory factory.
*
* @module AlohaFormattingFactory tests
*/

describe('Service: AlohaFormattingFactory', function () {
    var factory,
        formatters;

    // load the service's module
    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (AlohaFormattingFactory) {
        factory = AlohaFormattingFactory;

        // XXX: get the internal list of formatters
        // this is "cheating", b/c we assume here that the get() method works,
        // making other tests dependent on its correctness
        formatters = factory.get();
    }));

    it('has an empty list of formatters by default', function () {
        expect(formatters).toEqual([]);
    });

    describe('add() method', function () {
        it('adds formater to the list of formatters', function () {
            // make sure the formatters list is empty
            while(formatters.length > 0) {
                formatters.pop();
            }

            factory.add('Underline');
            expect(formatters).toEqual(['Underline']);
        });

        it('does not add a forbidden formater to the list of formatters',
            function () {
                // make sure the formatters list is empty
                while(formatters.length > 0) {
                    formatters.pop();
                }

                factory.add('Insertorderedlist');
                expect(formatters).toEqual([]);
            }
        );
    });

    describe('remove() method', function () {
        it('removes formater from the list of formatters', function () {
            // make sure the formatters list is empty
            while(formatters.length > 0) {
                formatters.pop();
            }
            formatters.push('Bold', 'Italic')

            factory.remove('Bold');
            expect(formatters).toEqual(['Italic']);
        });

        it('does not do anything if formatter is already not in ' +
           'the list of formatters',
           function () {
                // make sure the formatters list is empty
                while(formatters.length > 0) {
                    formatters.pop();
                }
                formatters.push('Bold', 'Italic')

                factory.remove('Underline');
                expect(formatters).toEqual(['Bold', 'Italic']);
            }
        );
    });

    describe('query() method', function () {
        it('returns false for forbidden formatters', function () {
            expect(factory.query('Insertorderedlist')).toBe(false);
        });

        it('returns false if formatter is not active', function () {
            spyOn(Aloha, 'queryCommandState').andReturn(false);
            expect(factory.query('Bold')).toBe(false);
        });

        it('returns true if formatter is active', function () {
            spyOn(Aloha, 'queryCommandState').andReturn(true);
            expect(factory.query('Bold')).toBe(true);
        });
    });

    describe('handling editor\'s selection changed event', function () {
        var activeFormatters,
            rootScope,
            $toolbar;

        beforeEach(inject(function (_$rootScope_) {
            rootScope = _$rootScope_;

            formatters.push('Bold', 'Italic', 'Underline');

            activeFormatters = {};
            spyOn(Aloha, 'queryCommandState').andCallFake(
                function (formatter) {
                    return !!activeFormatters[formatter];
                }
            );

            $toolbar = $([
                '<div class="fake-editor-toolbar">',
                  '<a><span class="editoricon-bold">B</span></a>',
                  '<a><span class="editoricon-italic">I</span></a>',
                  '<a><span class="editoricon-underline">U</span></a>',
                '</div>'
            ].join(''));

            $('body').append($toolbar);
        }));

        afterEach(function () {
            $toolbar.remove();
        });

        it('adds "active" CSS class to all active formatters', function () {
            var $parent;

            $toolbar.children().removeClass('active');  // mark all as inactive
            activeFormatters['Bold'] = true;
            activeFormatters['Underline'] = true;

            rootScope.$broadcast('texteditor-selection-changed');

            $parent = $toolbar.find('.editoricon-bold').parent();
            expect($parent.hasClass('active')).toBe(true);
            $parent = $toolbar.find('.editoricon-underline').parent();
            expect($parent.hasClass('active')).toBe(true);

            // inactive formatters do not get the class
            $parent = $toolbar.find('.editoricon-italic').parent();
            expect($parent.hasClass('active')).toBe(false);
        });

        it('removes "active" CSS class from all inactive formatters',
            function () {
                var $parent;

                $toolbar.children().addClass('active');  // mark all as active
                activeFormatters['Underline'] = true;

                rootScope.$broadcast('texteditor-selection-changed');

                $parent = $toolbar.find('.editoricon-bold').parent();
                expect($parent.hasClass('active')).toBe(false);
                $parent = $toolbar.find('.editoricon-italic').parent();
                expect($parent.hasClass('active')).toBe(false);

                // active formatters retain the class
                $parent = $toolbar.find('.editoricon-underline').parent();
                expect($parent.hasClass('active')).toBe(true);
            }
        );
    });
});
