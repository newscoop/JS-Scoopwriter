'use strict';

angular.module('authoringEnvironmentApp').service('imageResource', [
    '$resource',
    'transform',
    function imageResource($resource, transform) {
        return $resource(
            Routing.generate('newscoop_gimme_images_getimage', {}, true) + '/:id',
            {},
            {
                'modify': {
                    method: 'PATCH',
                    transformRequest: transform.formEncode
                }
            }
        );

    }
]);
