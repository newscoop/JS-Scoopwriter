'use strict';

/**
* A factory which creates a snippet model.
*
* @class Snippet
*/
angular.module('authoringEnvironmentApp').factory('Snippet', [
    '$http',
    '$q',
    'configuration',
    function ($http, $q, configuration) {
        var API_ROOT = configuration.API.full,
            self = this,
            Snippet = function () {};  // snippet constructor function

        /**
        * Converts plain snippet data object to a new Snippet instance.
        *
        * @method createFromApiData
        * @param data {Object} plain object containing snippet data
        *   (as returned by API)
        * @return {Object} new Snippet instance
        */
        // TODO: tests
        self.createFromApiData = function (data) {
            var snippet = Object.create(Snippet.prototype);
            // TODO: copy properties as needed
            ['id', 'title', 'code'].forEach(function (attribute) {
                snippet[attribute] = data[attribute];
            });
            return snippet;
        };

        /**
        * Retrieves a list of all snippets attached to a specific article.
        * Returned array has a special $promise property which is resolved or
        * rejected depending on the server response.
        *
        * @method getAllByArticle
        * @param number {Number} article ID
        * @param language {String} article language code, e.g. 'de'
        * @return {Object} "future" array of Snippet objects - initially
        *   an empty array is returned, which is later populated with the
        *   actual data (once the http promise has been successfully resolved)
        */
        Snippet.getAllByArticle = function (number, language) {
            var deferredGet = $q.defer(),
                snippets = [],
                url;

            url = [
                API_ROOT, 'snippets', 'article', number, language
            ].join('/');

            snippets.$promise = deferredGet.promise;

            $http.get(url, {
                params: {
                    items_per_page: 99999  // de facto "all"  XXX: needed?
                }
            }).success(function (response) {
                response.items.forEach(function (item) {
                    item = self.createFromApiData(item);
                    snippets.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return snippets;
        };

        // // TODO: tests
        // Snippet.create = function (name) {
        //     var deferredPost = $q.defer(),
        //         url = API_ROOT + '/snippets';

        //     $http.post(url, {
        //         name: name
        //     }).success(function (response) {
        //         var snippet = {};  // TODO: create new Snippet instance
        //         deferredPost.resolve(snippet);
        //     }).error(function (data, status, headers, config) {
        //         deferredPost.reject();  // XXX: give reason? responseBody?
        //     });

        //     return deferredPost.promise;
        // };

        // instance methods  XXX: just an example, later remove foo()
        Snippet.prototype.foo = function () {
            console.log('method foo');
        };

        return Snippet;
    }
]);
