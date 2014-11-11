'use strict';

/**
* A factory which creates a function for pre-loading an article
* from the server. Used in $routes definition.
*
* @class articleLoader
*/
angular.module('authoringEnvironmentApp').factory('articleLoader', [
    '$route',
    '$q',
    'Article',
    'article',
    function ($route, $q, Article, articleService) {

        return function () {
            var deferred = $q.defer(),
                params = $route.current.params;

            // NOTE: we don't directly return the promise given by getById()
            // method, but our own promise instead - we want to make sure that
            // articleInstance is available in the article service *before*
            // the promise gets resolved
            Article.getById(
                params.article, params.language
            )
            .then(function (articleInstance) {
                articleService.articleInstance = articleInstance;
                deferred.resolve(articleInstance);
            })
            .catch(function (errorMsg) {
                deferred.reject(errorMsg);
            });

            return deferred.promise;
        };
    }
]);
