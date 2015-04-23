'use strict';

/**
* Module with tests for the sfIframeLogin directive.
*
* @module sfIframeLogin directive tests
*/

describe('Directive: sfIframeLogin', function () {
    var scope,
        $compile;

    /**
    * Helper function which generates HTML snippet with the directive element
    * containing all given attributes.
    *
    * @function createHtmlTemplate
    * @param attrs {Object} mapping containing attribute names and their
    *   corresponding values
    * @return {String} generated HTML snippet
    */
    function createHtmlTemplate(attrs) {
        var html = ['<sf-iframe-login'];

        attrs = attrs || {};
        Object.keys(attrs).forEach(function (key) {
            html.push(' ' + key + '="' + attrs[key] + '"');
        });

        html.push('></sf-iframe-login>');
        return html.join('');
    }

    /**
    * Helper function that compiles an HTML template and links it with
    * provided scope.
    *
    * @function compileElement
    * @param template {String} HTML snippet to compile
    * @param scope {Object} scope to link the compiled element against
    * @return {Object} jQuery element representing the result of compilation
    */
    function compileElement(template, scope) {
        var $element = $compile(template)(scope);
        scope.$digest();
        return $element;
    }

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_$compile_, $rootScope) {
        $compile = _$compile_;
        scope = $rootScope.$new();
    }));

    it('produces an iframe', function () {
        var $element,
            template = createHtmlTemplate();

        $element = compileElement(template, scope);
        expect($element.is('iframe')).toBe(true);
    });

    describe('setting element attributes', function () {
        it('sets width to 570 by default', function () {
            var $element,
                template = createHtmlTemplate({'on-load': 'foo()'});
            $element = compileElement(template, scope);
            expect($element.attr('width')).toEqual('570');
        });

        it('sets width to given value, if available', function () {
            var $element,
                template = createHtmlTemplate({
                    width: 267,
                    'on-load': 'foo()'
                });
            $element = compileElement(template, scope);
            expect($element.attr('width')).toEqual('267');
        });

        it('sets height to 510 by default', function () {
            var $element,
                template = createHtmlTemplate({'on-load': 'foo()'});
            $element = compileElement(template, scope);
            expect($element.attr('height')).toEqual('510');
        });

        it('sets height to given value, if available', function () {
            var $element,
                template = createHtmlTemplate({
                    height: 567,
                    'on-load': 'foo()'
                });
            $element = compileElement(template, scope);
            expect($element.attr('height')).toEqual('567');
        });

        it('sets correct src', function () {
            var $element,
                expectedUrl,
                template = createHtmlTemplate({'on-load': 'foo()'});

            // NOTE: these settings (URL, client_id, etc.) are defined in the
            // global AES_SETTINGS object mock
            expectedUrl = [
                'http://server.net/oauth',
                '?client_id=1234_qwerty',
                '&redirect_uri=http://redirect.me:80',
                '&response_type=token'
            ].join('');

            $element = compileElement(template, scope);
            expect($element.attr('src')).toEqual(expectedUrl);
        });
    });

});
