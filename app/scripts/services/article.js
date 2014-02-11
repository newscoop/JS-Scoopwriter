'use strict';

angular.module('authoringEnvironmentApp')
    .service('article', ['$resource', 'configuration', '$q', function article($resource, configuration, $q) {

        var resource = $resource(
            configuration.API.full + '/articles/:articleId?language=:language',
            {},
            {
                query: {
                    method: 'GET',
                    params: {articleId: '', language: 'en'},
                    isArray: true
                }
            });

        var deferred = $q.defer();

        return {
            resource: resource,
            promise: deferred.promise,
            init: function(par) {
                resource.get(par).$promise.then(function(data) {
                    deferred.resolve(data);
                });
            }
        };
    }]);
