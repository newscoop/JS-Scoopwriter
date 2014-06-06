'use strict';

/**
* A factory which creates a snippet model.
*
* @class Snippet
*/
'use strict';
angular.module('authoringEnvironmentApp').factory('Snippet', [
    function () {
        var self = this,
            Snippet = function () {};

        // class methods

        // TODO: comments and tests
        Snippet.getAll = function (articleId, articleLang) {
            // TODO: return empty array object, populate it when
            // data gets there ... also this array should have $promise
            // property

            // GET '/api/snippets/:template'
        };

        // instance methods
        Snippet.prototype.foo = function () {

        };

        return Snippet;

        // return {
        //     all: $resource('/api/snippets/:template'),
        //     single: $resource('/api/snippets/:template/:id', {}, {
        //         get: {
        //             method: 'GET',
        //             params: {
        //                 template: 'generic',
        //                 id: ''
        //             },
        //             isArray: false
        //         }
        //     }),
        //     article: $resource('/api/article/:articleId/:articleLanguage/snippets/:id', {}, {
        //         all: {
        //             method: 'GET',
        //             params: {
        //                 articleId: '',
        //                 articleLanguage: ''
        //             },
        //             isArray: false
        //         },
        //         specific: {
        //             method: 'GET',
        //             params: {
        //                 articleId: '',
        //                 articleLanguage: '',
        //                 id: ''
        //             },
        //             isArray: false
        //         }
        //     })
        // };    // // Service logic
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
