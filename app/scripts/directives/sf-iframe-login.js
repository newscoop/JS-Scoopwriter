/* global CSClientId */
'use strict';

/**
* A directive which creates an iframe containing the Newscoop login form.
*
* @class sfIframeLogin
*/
// TODO: tests.. and explain that CSClientId is set in html template
angular.module('authoringEnvironmentApp').directive('sfIframeLogin', [
    'configuration',
    function (configuration) {
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

                url = [
                    configuration.auth.server,
                    '?client_id=', CSClientId,
                    '&redirect_uri=', configuration.auth.redirect_uri,
                    '&response_type=token'
                ].join('');

                $element.attr('src', url);

                $element.attr('width', attrs.width || 570);
                $element.attr('height', attrs.height || 510);

                $element.on('load', function () {
                    try {
                        scope.onLoadHandler({
                            location: $element[0].contentWindow.location
                        });
                    } catch (e) {
                        // TODO: explain why this
                        console.log('Exception iframeLoaded', e);
                    }
                });
            }
        };
    }
]);
