'use strict';

/**
* A factory which creates an article type model.
*
* @class ArticleType
*/
angular.module('authoringEnvironmentApp').factory('ArticleType', [
    '$http',
    '$q',
    function ($http, $q) {
        var self = this,
            ArticleType = function () {};  // constructor function

        /**
        * Creates a new ArticleType instance from a plain data object.
        *
        * @method createFromApiData
        * @param data {Object} plain object containing article type data
        *   (as returned by API)
        * @return {Object} new ArticleType instance
        */
        // TODO: tests
        self.createFromApiData = function (data) {
            var instance = new ArticleType();

            instance.name = data.name;

            instance.fields = [];
            data.fields.forEach(function (field) {
                instance.fields.push(field);
            });

            return instance;
        };

        /**
        * Retrieves a specific article type descriptor from the server.
        *
        * @method getByName
        * @param name {String} name of the article type to retrieve
        * @return {Object} promise object that is resolved with retrieved
        *   ArticleType instance on success and rejected with server error
        *   message on failure.
        */
        // TODO: tests
        ArticleType.getByName = function (name) {
            var deferredGet = $q.defer(),
                url = Routing.generate(
                    'newscoop_gimme_articletypes_getarticletype',
                    {name: name}, true
                );

            $http.get(url)
            .success(function (response) {
                deferredGet.resolve(self.createFromApiData(response));
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return deferredGet.promise;
        };

        // expose as "class" method
        ArticleType.createFromApiData = self.createFromApiData;

        return ArticleType;
    }
]);
