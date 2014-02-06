'use strict';

angular.module('authoringEnvironmentApp')
    .factory('configuration', function () {
        return {
            auth: {
                client_id: '3_uutz7mlvof4kc4wckcgcs4wg8oosgwg8gg4cg0wkkk0cc0w0k',
                client_secret: '2q1prvmzi8w0s4ssg8c80wk0cg840g8sko488g4g04c4gskgoc',
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
                    fieldWeight: 1,
                    type: 'fixed_image',
                    isContentField: true,
                    description: 'Article Main Image'
                }]
            }
        };
    });
