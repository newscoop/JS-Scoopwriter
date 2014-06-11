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

        /**
        * Creates a new snippet on the server and returns a Snippet instance
        * representing it.
        *
        * @method create
        * @param name {String} new snippet's name
        * @param templateId {Number} ID of the snippet template to use
        *   by the new snippet
        * @param fields {Object} object with (key, value) pairs, where "key" is
        *   a name of a field in the snippet template and "value" is the
        *   value to use for this field
        * @return {Object} promise object which is resolved with new Snippet
        *   instance on success and rejected on error
        */
        Snippet.create = function (name, templateId, fields) {
            var deferredPost = $q.defer(),
                postData = {},
                url = API_ROOT + '/snippets';

            postData.name = name;
            postData.template = templateId;

            _.forEach(fields, function (fieldValue, fieldName) {
                var paramName = 'snippet[fields][][' + fieldName + ']';
                postData[paramName] = fieldValue;
            });

            $http.post(
                url, postData
            ).success(function (response) {
                var snippet = {foo: 'bar'};  // TODO: create new Snippet instance
                deferredPost.resolve(snippet);
            }).error(function (responseBody) {
                deferredPost.reject(responseBody);
            });

            return deferredPost.promise;
        };

        // instance methods  XXX: just an example, later remove foo()
        Snippet.prototype.foo = function () {
            console.log('method foo');
        };

        return Snippet;
    }
]);
