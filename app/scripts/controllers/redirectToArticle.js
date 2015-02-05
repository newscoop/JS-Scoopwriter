'use strict';

/**
* AngularJS controller for determining which article to display and
* redirecting to that article.
*
* @class RedirectToArticleCtrl
*/
angular.module('authoringEnvironmentApp').controller('RedirectToArticleCtrl', [
    '$location',
    'toaster',
    function ($location, toaster) {
        var self = this;

        self.hasError = false;

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

        self.articleNumber = null;
        // if there is a problem, see if we can determine what the problem 
        // might be for the user
        if (AES_SETTINGS) {
            if (AES_SETTINGS.articleInfo) {
                if (AES_SETTINGS.articleInfo.articleNumber) {
                    self.articleNumber = AES_SETTINGS.articleInfo.articleNumber;
                } else {
                    toaster.add({
                        type: 'sf-error',
                        message: 'You are missing AES_SETTINGS.artcleInfo config.'
                    });
                    self.hasErrors = true;        
                }
            } else {
                toaster.add({
                    type: 'sf-error',
                    message: 'You are missing AES_SETTINGS.artcleInfo config.'
                });
                self.hasErrors = true;        
            }
        } else {
            toaster.add({
                type: 'sf-error',
                message: 'You are missing AES_SETTINGS config.'
            });
            self.hasErrors = true;        
        }

        // if all is well, redirect to the article
        if (self.articleNumber) {
            var newPath = [
                '/', AES_SETTINGS.articleInfo.language,
                '/', AES_SETTINGS.articleInfo.articleNumber
            ].join('');

            $location.path(newPath);
        }
    }
]);
