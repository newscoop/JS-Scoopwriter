'use strict';

/**
* A directive which creates an iframe containing the Newscoop login form.
*
* @class sfIframeLogin
*/
angular.module('authoringEnvironmentApp').directive('sfIframeLogin', [
    function () {
        return {
            template: '<iframe></iframe>',
            replace: true,
            restrict: 'E',
            link: function(scope, $element, attrs) {
                var url;


                // NOTE: when bundled into a Newscoop plugin, AES_SETTINGS is
                // available as a global variable (it is set by the PHP code
                // that produces the index.html file containing our app)
                url = [
                    AES_SETTINGS.auth.server,
                    '?client_id=', AES_SETTINGS.auth.client_id,
                    '&redirect_uri=', AES_SETTINGS.auth.redirect_uri,
                    '&response_type=token'
                ].join('');

                $element.attr('src', url);
                $element.attr('width', attrs.width || 570);
                $element.attr('height', attrs.height || 510);
            }
        };
    }
]);
