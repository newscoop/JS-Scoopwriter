'use strict';

/**
* AngularJS controller for the Switches pane.
*
* @class PaneSwitchesCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneSwitchesCtrl', [
    '$q',
    'article',
    'ArticleType',
    function ($q, article, ArticleType) {
        var self = this;

        // load article's switches' values
        article.promise.then(
            function (articleData) {
                self.articleData = articleData;
                return ArticleType.getByName(articleData.type);
            }, $q.reject
        ).then(function (articleType) {
            articleType.fields.forEach(function (field) {
                var value;

                if (field.type === 'switch') {
                    // convert raw data to boolean
                    value = !!parseInt(self.articleData.fields[field.name]);
                    self.switches.push({
                        name: field.name,
                        value: value
                    });
                }
            });
        });

        /**
        * Checkbox value changed event handler. Sets the dirty flag.
        *
        * @method valueChanged
        */
        // TODO: tests
        self.valueChanged = function () {
            self.modified = true;
        };

        /**
        * Updates article's switches' values on the server.
        *
        * @method save
        */
        // TODO: tests
        self.save = function () {
            var articleData;

            self.saveInProgress = true;

            articleData = {
                articleId: self.articleData.number,
                language: self.articleData.language,
                switches: self.switches
            }

            article.saveSwitches(articleData)
            .finally(function () {
                self.modified = false;
                self.saveInProgress = false;
            });
        };

        self.switches = [];
        self.modified = false;  // are there any unsaved changes?
        self.saveInProgress = false;  // saving to server in progress?
    }
]);
