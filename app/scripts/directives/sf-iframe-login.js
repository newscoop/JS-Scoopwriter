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
            scope: {
                onLoadHandler: '&onLoad'
            },
            link: function(scope, $element, attrs) {
                var url;

                if (!attrs.onLoad) {
                    throw 'sfIframeLogin: missing onLoad handler';
                }

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

                $element.on('load', function () {
                    try {
                        scope.onLoadHandler();
                    } catch (e) {
                        // A security exception occurs when trying to access
                        // iframe's contents when login comes from a different
                        // origin. We simply silence such exceptions, because
                        // the only load event we are interested in is when
                        // the login form redirects us back to our own
                        // domain - that redirection URL contains auth. token.
                    }
                });
            }
        };
    }
]);
