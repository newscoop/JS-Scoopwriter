'use strict';

angular.module('authoringEnvironmentApp')
    .factory('configuration', function () {
        return {
            auth: {
                client_id: '1_2gkjgb9tl0sgwow8w4ksg4ws4wkw8884c848kwgkw4k8gc4woc',
                client_secret: '60mtm1heov8kwskss8gcg0cokwckkkk0cowocos4swc4g80s80'
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
