'use strict';

/**
* AngularJS service for populating data
* between page views.
*
* @class pageHelper
*/
angular.module('authoringEnvironmentApp').service('pageHelper', [
    '$rootScope',
    'article',
    'TranslationService',
    function ($rootScope, articleService, TranslationService) {
        var self = this;

        /**
        * Populates article title in the HTML title tag.
        *
        * @method populateHeaderTitle
        */
        self.populateHeaderTitle = function () {
            var article = articleService.articleInstance;
            $rootScope.headerTitle = TranslationService.trans('aes.name') +
                ' - ' + article.title;
        };
    }
]);
