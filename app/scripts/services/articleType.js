'use strict';
angular.module('authoringEnvironmentApp').service('articleType', [
    '$resource',
    function articleType($resource) {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return $resource(Routing.generate('newscoop_gimme_articletypes_getarticletypes', {}, true) + '/:type', {}, {
            query: {
                method: 'GET',
                params: { type: '' },
                isArray: true
            }
        });
    }
]);