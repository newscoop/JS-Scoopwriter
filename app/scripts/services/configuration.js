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
        // XXX: this will most likely be replaced by articleTypeFields
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
        },

        // configuration of the fields and their order for all supported
        // article types
        // XXX: field weight is taken from API data? and for the fields NOT
        // returned by the api, the config here specifies their weights?
        articleTypeFields: {
            news: {
                dateline: {  // article field
                    name:'dateline',
                    order: 10
                },
                title: {  // article name
                    name: 'title',
                    order: 20
                },
                lede: {  // field
                    name: 'lede',
                    order: 30
                },
                mainImage: {  // defined only in config
                    name: 'mainImage',
                    order: 40
                },
                body: {  // field
                    name: 'body',
                    order: 50
                }
            },
            newswire: {
                dateline: {  // article field
                    name:'dateline',
                    order: 10
                },
                title: {  // article name
                    name: 'title',
                    order: 20
                },
                // XXX: could this be upper-cased? as retrieved it is DataLead
                dataLead: {  // field
                    name: 'dataLead',
                    order: 30
                },
                mainImage: {  // defined only in config
                    name: 'mainImage',
                    order: 40
                },
                // XXX: could this be upper-cased? retrieved it is DataContent
                dataContent: {  // field
                    name: 'dataContent',
                    order: 50
                }
            },
            blog: {
                title: {  // article name
                    name: 'title',
                    order: 10
                },
                lede: {  // field
                    name: 'lede',
                    order: 20
                },
                mainImage: {  // defined only in config
                    name: 'mainImage',
                    order: 30
                },
                body: {  // field
                    name: 'body',
                    order: 40
                }
            }
        }  // end articleTypeFields
    };
});