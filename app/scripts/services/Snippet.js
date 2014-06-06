'use strict';

/**
* A factory which creates a snippet model.
*
* @class Snippet
*/
'use strict';
angular.module('authoringEnvironmentApp').factory('Snippet', [
    '$resource',
    function ($resource) {
        return {
            all: $resource('/api/snippets/:template'),
            single: $resource('/api/snippets/:template/:id', {}, {
                get: {
                    method: 'GET',
                    params: {
                        template: 'generic',
                        id: ''
                    },
                    isArray: false
                }
            }),
            article: $resource('/api/article/:articleId/:articleLanguage/snippets/:id', {}, {
                all: {
                    method: 'GET',
                    params: {
                        articleId: '',
                        articleLanguage: ''
                    },
                    isArray: false
                },
                specific: {
                    method: 'GET',
                    params: {
                        articleId: '',
                        articleLanguage: '',
                        id: ''
                    },
                    isArray: false
                }
            })
        };    // // Service logic
              // // ...
              // var meaningOfLife = 42;
              // // Public API here
              // return {
              //   someMethod: function () {
              //     return meaningOfLife;
              //   }
              // };
    }
]);
