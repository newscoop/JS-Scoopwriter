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
