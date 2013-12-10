'use strict';

angular.module('authoringEnvironmentApp')
  .service('Articletype', function Articletype($resource) {
    var b;
    // devcode: !newscoop
    b = 'http://tw-merge.lab.sourcefabric.org';
    // endcode
    // devcode: newscoop
    b = '';
    // endcode

    // AngularJS will instantiate a singleton by calling "new" on this function
    return $resource(b+'/api/articleTypes/:type', {}, {
      query: {method: 'GET', params: {type: ''}, isArray: true}
    });
  });
