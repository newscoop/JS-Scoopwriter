'use strict';

angular.module('authoringEnvironmentApp')
    .service('imageResource', ['$resource', 'configuration', 'transform', function imageResource($resource, configuration, transform) {
        return $resource(configuration.API.full + '/images/:id', {
            }, {
            'modify': {
                method: 'PATCH',
                transformRequest: transform.formEncode
            }
        });
    }]);
