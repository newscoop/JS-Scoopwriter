/* this file is included in karma conf in order to configure Aloha
 * like in production */
// mock aloha block plugin
$.fn.alohaBlock = function() {
    return this;
};
// Restore the global $ and jQuery variables of your project's jQuery
var Aloha = {};
Aloha.settings = {};
Aloha.settings.jQuery = window.jQuery.noConflict(true);


/* added because Translator is expected to be available in window object */
var window,
    Translator,
    mockTranslator;

beforeEach(function () {
    mockTranslator = {
        trans: function (value) {
            return value;
        }
    };

    window.Translator = mockTranslator;
});

afterEach(function () {
    delete window.Translator;
    delete $.fn.alohaBlock;
});

