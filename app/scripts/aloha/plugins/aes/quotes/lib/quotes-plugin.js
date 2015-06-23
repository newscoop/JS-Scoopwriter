/* quotes-plugin.js is part of the Aloha Editor project http://aloha-editor.org
 *
 * Aloha Editor is a WYSIWYG HTML5 inline editing library and editor.
 * Copyright (c) 2010-2014 Gentics Software GmbH, Vienna, Austria.
 * Contributors http://aloha-editor.org/contribution.php
 * License http://aloha-editor.org/license.php
 */
define([
    'aloha',
    'jquery',
    'PubSub',
    'aloha/plugin',
    'util/dom',
], function (
    Aloha,
    $,
    PubSub,
    Plugin,
    Dom
) {
    'use strict';

    var ns  = 'aloha-quotes';

    // namespaced classnames
    var nsClasses = {
        'blockquote'  : nsClass('blockquote')
    };

    /**
     * Simple templating
     *
     * @param {String} str - The string containing placeholder keys in curly
     *                       brackets
     * @param {Object} obj - Associative array of replacing placeholder keys
     *                       with corresponding values
     */
    function supplant(str, obj) {
        return str.replace(/\{([a-z0-9\-\_]+)\}/ig,
            function (str, p1, offset, s) {
                var replacement = obj[p1] || str;
                return (typeof replacement === 'function') ?
                    replacement() :
                    replacement;
            });
    }

    /**
     * Wrapper to call the supplant method on a given string, taking the
     * nsClasses object as the associative array containing the replacement
     * pairs
     *
     * @param {String} str
     * @return {String}
     */
    function renderTemplate(str) {
        return (typeof str === 'string') ? supplant(str, nsClasses) : str;
    }

    /**
     * Generates a selector string with this plugins's namespace prefixed the
     * each classname.
     *
     * Usage:
     *    nsSel('header,', 'main,', 'foooter ul')
     *    will return
     *    ".aloha-myplugin-header, .aloha-myplugin-main, .aloha-mypluzgin-footer ul"
     *
     * @return {string}
     */
    function nsSel() {
        var strBldr = [], prx = ns;
        $.each(arguments, function () {
            strBldr.push('.' + ('' === this ? prx : prx + '-' + this));
        });
        return $.trim(strBldr.join(' '));
    }

    /**
     * Generates a string with this plugins's namespace prefixed the each
     * classname.
     *
     * Usage:
     *      nsClass('header', 'innerheaderdiv')
     *      will return
     *      "aloha-myplugin-header aloha-myplugin-innerheaderdiv"
     *
     * @return {string}
     */
    function nsClass() {
        var strBldr = [], prx = ns;
        $.each(arguments, function () {
            strBldr.push('' === this ? prx : prx + '-' + this);
        });
        return $.trim(strBldr.join(' '));
    }

    return Plugin.create('quotes', {

        settings: null,
        config: ['quote', 'blockquote'],

        init: function () {
            var plugin = this;

            Aloha.addBlockQuote = function () {
                plugin.addBlockQuote();
            }

            Aloha.removeBlockQuote = function () {
                plugin.removeBlockQuote();
            }

            // Harverst configuration options that may be defined outside of the
            // plugin
            if (Aloha.settings && Aloha.settings.plugins && Aloha.settings.plugins.quotes) {

                if (typeof Aloha.settings.plugins.quotes !== 'undefined') {
                    plugin.settings = Aloha.settings.plugins.quotes;
                }
            }

            PubSub.sub('aloha.selection.context-change', function (message) {
                var nodeName;
                var effective = message.range.markupEffectiveAtStart;
                var i = effective.length;

                Aloha.blockquoteFound = false;
                // Check whether any of the effective items are citation tags
                while (i) {
                    nodeName = effective[--i].nodeName;
                    if (nodeName === 'BLOCKQUOTE') {
                        Aloha.blockquoteFound = true;
                    }
                }

                if (!Aloha.activeEditable) {
                    return;
                }
            });
        },

        /**
         * Formats the current selection with blockquote.
         */
        addBlockQuote: function () {
            // Mozilla needs this fix or else the selection will not work
            if (Aloha.activeEditable && $.browser.mozilla) {
                Aloha.activeEditable.obj.focus();
            }

            var markup = $('<blockquote></blockquote>');
            Aloha.Selection.changeMarkupOnSelection(markup);
            Aloha.blockquoteFound = true;
            Aloha.trigger('aloha-smart-content-changed', {
                'editable': Aloha.activeEditable
            });
        },

        /**
         * Removes blockquote from the current selection.
         */
        removeBlockQuote: function () {
            // Mozilla needs this fix or else the selection will not work
            if (Aloha.activeEditable && $.browser.mozilla) {
                Aloha.activeEditable.obj.focus();
            }
            var markup = $('<p></p>');
            Aloha.Selection.changeMarkupOnSelection(markup);
            Aloha.blockquoteFound = false;
            Aloha.trigger('aloha-smart-content-changed', {
                'editable': Aloha.activeEditable
            });
        },

        /**
         * Makes the given jQuery object (representing an editable) clean for
         * saving Find all quotes and remove editing objects.
         *
         * @param {jQuery.<Element>} $element
         */
        makeClean: function ($element) {
            var plugin = this;
            $element.find('q,blockquote').each(function () {
                var $elem = $(this);
                // Remove empty class attributes
                if ($.trim($elem.attr('class')) === '') {
                    $elem.removeAttr('class');
                }
                $elem.removeClass('aloha-quotes-' + $elem.attr('data-quotes-id'));
            
                // We need to read this attribute for IE7 otherwise it will
                // crash when the attribute gets removed. In IE7 this
                // removal does not work at all. (no wonders here.. :.( )
                if ($elem.attr('data-quotes-id') != null) {
                    $elem.removeAttr('data-quotes-id');
                }
                $elem.removeClass('aloha-quotes-wrapper');
            });
        }
    });
});
