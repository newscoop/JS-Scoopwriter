'use strict';

angular.module('authoringEnvironmentApp')
    .factory('configuration', function () {
        return {
            API: {
                rootURI: 'http://tw-merge.lab.sourcefabric.org',
                endpoint: '/content-api',
                full: 'http://tw-merge.lab.sourcefabric.org/content-api'
            },
            auth: {
                client_id: '3_uutz7mlvof4kc4wckcgcs4wg8oosgwg8gg4cg0wkkk0cc0w0k',
                redirect_uri: 'http://localhost:9000',
                server: 'http://tw-merge.lab.sourcefabric.org/oauth/v2/auth?'
            },
            article: {
                width: {
                    desktop: 960,
                    tablet: 600,
                    phone: 320
                }
            },
            image: {
                width: {
                    small: '30%',
                    medium: '50%',
                    big: '100%'
                },
                float: 'none'
            },
            additionalFields: {
                news: [{
                    name: 'main_image',
                    fieldWeight: 10,
                    type: 'fixed_image',
                    isContentField: true,
                    description: 'Article Main Image'
                }]
            }
        };
    });
