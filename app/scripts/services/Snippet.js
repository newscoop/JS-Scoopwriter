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
    'transform',
    function ($http, $q, configuration, transform) {
        var API_ENDPOINT = configuration.API.endpoint,
            API_ROOT = configuration.API.full,
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
        self.createFromApiData = function (data) {
            var snippet = Object.create(Snippet.prototype);

            ['id', 'templateId', 'name'].forEach(function (attribute) {
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
                    items_per_page: 99999  // de facto "all"
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

            postData['snippet[name]'] = name;
            postData.template = templateId;

            _.forEach(fields, function (fieldValue, fieldName) {
                var paramName = 'snippet[fields][' + fieldName + '][data]';
                postData[paramName] = fieldValue;
            });

            $http.post(url, postData, {
                transformRequest: transform.formEncode
            })
            .then(function (response) {
                var resourceUrl = response.headers('x-location');
                return $http.get(resourceUrl);  // retrieve created snippet
            }, function () {
                return $q.reject();
            })
            .then(function (response) {
                var snippet = self.createFromApiData(response.data);
                deferredPost.resolve(snippet);
            }, function () {
                deferredPost.reject();
            });

            return deferredPost.promise;
        };

        /**
        * Attaches snippet to article.
        *
        * @method addToArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Snippet.prototype.addToArticle = function (number, language) {
            var snippet = this,
                deferred = $q.defer(),
                linkHeader,
                url;

            url = [API_ROOT, 'articles', number, language].join('/');

            linkHeader = '<' + API_ENDPOINT + '/snippets/' + snippet.id +
                            '; rel="snippet">';

            $http({
                url: url,
                method: 'LINK',
                headers: {link: linkHeader}
            })
            .success(function () {
                deferred.resolve();
            })
            .error(function (responseBody) {
                deferred.reject(responseBody);
            });

            return deferred.promise;
        };

        return Snippet;
    }
]);
