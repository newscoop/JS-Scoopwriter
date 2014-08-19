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

        // Configuration of the fields and their order for all supported
        // article types - only these fields are visible to user and available
        // for editing, even though a particular article type might have
        // some other fields defined as well.
        //
        // Regular fields that are defined for the article type can also
        // have default text set, which is displayed if that field is empty.
        articleTypeFields: {
            news: {
                dateline: {
                    name:'dateline',
                    order: 10,
                    defaultText: '[please provide article creation date]'
                },
                title: {  // article title (not a regular field from DB)
                    name: 'title',
                    order: 20
                },
                lede: {
                    name: 'lede',
                    order: 30,
                    defaultText: '[please provide your content]'
                },
                mainImage: {  // not a regular field from DB
                    name: 'mainImage',
                    order: 40
                },
                body: {
                    name: 'body',
                    order: 50,
                    defaultText: '[please provide your content]'
                }
            },
            newswire: {
                dateline: {
                    name:'dateline',
                    order: 10,
                    defaultText: '[please provide article creation date]'
                },
                title: {  // article title (not a regular field from DB)
                    name: 'title',
                    order: 20
                },
                dataLead: {
                    name: 'dataLead',
                    order: 30,
                    defaultText: '[please provide your content]'
                },
                mainImage: {  // not a regular field from DB
                    name: 'mainImage',
                    order: 40,
                },
                dataContent: {
                    name: 'dataContent',
                    order: 50,
                    defaultText: '[please provide your content]'
                }
            },
            blog: {
                title: {  // article title (not a regular field from DB)
                    name: 'title',
                    order: 10
                },
                lede: {
                    name: 'lede',
                    order: 20,
                    defaultText: '[please provide your content]'
                },
                mainImage: {  // not a regular field from DB
                    name: 'mainImage',
                    order: 30,
                    isRegular: false
                },
                body: {
                    name: 'body',
                    order: 40,
                    defaultText: '[please provide your content]'
                }
            }
        }  // end articleTypeFields
    };
});