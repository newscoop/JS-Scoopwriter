'use strict';

/**
* AngularJS controller for displaying a modal containing the article preview.
*
* @class ArticlePreviewCtrl
*/
angular.module('authoringEnvironmentApp').controller('ArticlePreviewCtrl', [
    'article',
    function (article) {
        console.debug('this is ArticlePreviewCtrl');
    }
]);
