/*global articleInfo */
'use strict';

/**
* AngularJS controller for determining which article to display and
* redirecting to that article.
*
* @class RedirectToArticleCtrl
*/
angular.module('authoringEnvironmentApp').controller('RedirectToArticleCtrl', [
    '$location',
    function ($location) {
        // NOTE: why are we doing (reading info from a global Javascript
        // object) instead of directly linking to the actual article URL?
        // (e.g. http://domain.com/#/en/123)
        //
        // The reason is that linking an article from Newscoop (Symphony
        // framework) with an URL containing stuff after '#' creates all sorts
        // of problems on the backend (e.g. Symphony stripping the part after
        // the '#' character), making it much more complicated to use such
        // URLs in a Newscoop plugin. It was thus decided that a global
        // object containing article info would be provided and Angular will
        // then make sure that user gets redirected to the correct article
        // (with URL now containing the necessary part after '#').

        var newPath = [
            '/', articleInfo.language, '/', articleInfo.articleNumber
        ].join('');

        $location.path(newPath);
    }
]);
