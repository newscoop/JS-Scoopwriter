'use strict';
angular.module('authoringEnvironmentApp').factory('configuration', function () {
    return {
        API: {
            rootURI: 'http://newscoop.aes.sourcefabric.net',
            endpoint: '/content-api',
            full: 'http://newscoop.aes.sourcefabric.net/content-api'
        },
        auth: {
            client_id: '7_6203opwgvx8g4skgskksgkws8cs44ks8s4cw4sc8cg4wsk8c40',
            redirect_uri: 'http://localhost:9000',
            server: 'http://newscoop.aes.sourcefabric.net/oauth/v2/auth?'
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
            news: [
                {
                    name: 'main_image',
                    fieldWeight: 10,
                    isContentField: true
                },
                {
                    name: 'title',
                    fieldWeight: 0,
                    isContentField: true
                }
            ]
        }
    };
});