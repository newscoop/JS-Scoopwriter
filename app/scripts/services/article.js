'use strict';

angular.module('authoringEnvironmentApp')
  .service('Article', function Article($resource) {
    var b;
    // devcode: !newscoop
    b = 'http://tw-merge.lab.sourcefabric.org';
    // endcode
    // devcode: newscoop
    b = '';
    // endcode

    // AngularJS will instantiate a singleton by calling "new" on this function
    return $resource(b+'/api/articles/:articleId', {}, {
      query: {method: 'GET', params: {articleId: ''}, isArray: true}
    });
  });
