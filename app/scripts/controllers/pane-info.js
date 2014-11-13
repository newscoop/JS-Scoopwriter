'use strict';

/**
* AngularJS controller for the Info pane.
*
* @class PaneInfoCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneInfoCtrl', [
    'article',
    function (articleService) {
        var self = this;
        self.article = articleService.articleInstance;
    }
]);
