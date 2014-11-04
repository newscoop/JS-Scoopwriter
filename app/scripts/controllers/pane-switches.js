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
                self.articleObj = articleData;
                return ArticleType.getByName(articleData.type);
            }, $q.reject
        ).then(function (articleType) {
            articleType.fields.forEach(function (field) {
                if (field.type === 'switch') {
                    self.switchNames.push(field.name);

                    // convert all switch values to boolean (undefined
                    // field values get converted to false)
                    self.articleObj.fields[field.name] =
                        !!parseInt(self.articleObj.fields[field.name]);
                }
            });
        });

        /**
        * Checkbox value changed event handler. Sets the dirty flag.
        *
        * @method valueChanged
        */
        self.valueChanged = function () {
            self.modified = true;
        };

        /**
        * Updates article's switches' values on the server.
        *
        * @method save
        */
        self.save = function () {
            self.saveInProgress = true;

            article.saveSwitches(
                self.articleObj, self.switchNames
            ).finally(function () {
                self.modified = false;
                self.saveInProgress = false;
            });
        };

        self.switchNames = [];
        self.modified = false;  // are there any unsaved changes?
        self.saveInProgress = false;  // saving to server in progress?
    }
]);
