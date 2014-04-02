'use strict';
angular.module('authoringEnvironmentApp').service('articleType', [
    '$resource',
    'configuration',
    function articleType($resource, conf) {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return $resource(conf.API.full + '/articleTypes/:type', {}, {
            query: {
                method: 'GET',
                params: { type: '' },
                isArray: true
            }
        });
    }
]);