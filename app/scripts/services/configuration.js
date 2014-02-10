'use strict';

angular.module('authoringEnvironmentApp')
    .factory('configuration', function () {
        return {
            auth: {
                client_id: '2_66ch74l8s8g8c0wg8cggwkkss0404o04gwsk88kc4cwcs84os4',
                client_secret: '5rjd21cgrjks0oo880sg88kg8o048gcwows8s0w0ow08g48wk4',
                redirect_uri: 'https://tw-merge.lab.sourcefabric.org'
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
