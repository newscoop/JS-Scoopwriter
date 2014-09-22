'use strict';

/**
* A factory which creates a snippet model.
*
* @class Snippet
*/
angular.module('authoringEnvironmentApp').factory('Snippet', [
    '$http',
    '$q',
    function ($http, $q) {
        var self = this,
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
            var snippet = new Snippet();

            ['id', 'templateId', 'name', 'render'].forEach(
                function (attribute) {
                    snippet[attribute] = data[attribute];
                }
            );

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
                reqParams,
                snippets = [];

            snippets.$promise = deferredGet.promise;

            reqParams = {
                params: {
                    rendered: true,
                    items_per_page: 99999  // de facto "all"
                }
            };

            $http.get(
                Routing.generate(
                    'newscoop_gimme_snippets_getsnippetsforarticle_1',
                    {number: number, language: language},
                    true
                ),
                reqParams
            ).success(function (response) {
                if (response.items) {
                    response.items.forEach(function (item) {
                        item = self.createFromApiData(item);
                        snippets.push(item);
                    });
                }
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return snippets;
        };

        /**
        * Retrieves a specific snippet from the server.
        *
        * @method getById
        * @param snippetId {Number} ID of the snippet to retrieve
        * @return {Object} promise object which is resolved with retrieved
        *   Snippet instance on success and rejected with server error
        *   message on failure
        */
        Snippet.getById = function (snippetId) {
            var deferredGet = $q.defer(),
                url = Routing.generate(
                    'newscoop_gimme_snippets_getsnippet',
                    {snippetId: snippetId}, true
                );

            $http.get(url, {
                params: {
                    rendered: true
                }
            })
            .success(function (response) {
                deferredGet.resolve(self.createFromApiData(response));
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return deferredGet.promise;
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
                requestData;

            requestData = {
                template: templateId,
                snippet: {
                    name: name,
                    fields: {}
                }
            };

            _.forEach(fields, function (fieldValue, fieldName) {
                requestData.snippet.fields[fieldName] = {
                    data: fieldValue
                };
            });

            $http.post(
                Routing.generate(
                    'newscoop_gimme_snippets_createsnippet', {}, true
                ),
                requestData
            )
            .then(function (response) {
                var resourceUrl = response.headers('x-location');
                return $http.get(    // retrieve created snippet
                    resourceUrl, {params: {rendered: true}}
                );
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
                linkHeader;

            linkHeader =
                '<' +
                Routing.generate(
                    'newscoop_gimme_snippets_getsnippet',
                    {snippetId: snippet.id},
                    false
                ) +
                '; rel="snippet">';

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_linkarticle',
                    {number: number, language: language},
                    true
                ),
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

        /**
        * Detaches snippet from article.
        *
        * @method removeFromArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Snippet.prototype.removeFromArticle = function(number, language) {
            var snippet = this,
                deferred = $q.defer(),
                linkHeader;

            linkHeader = '<' +
                Routing.generate(
                    'newscoop_gimme_snippets_getsnippet',
                    {snippetId: snippet.id},
                    false
                ) +
                '; rel="snippet">';

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_unlinkarticle',
                    {number: number, language:language},
                    true
                ),
                method: 'UNLINK',
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
