'use strict';

/**
* AngularJS controller for the Switches pane.
*
* @class PaneSwitchesCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneSwitchesCtrl', [
    '$scope',
    '$q',
    'article',
    'ArticleType',
    function ($scope, $q, article, ArticleType) {
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
                    $scope.switches.push({
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
        $scope.valueChanged = function () {
            $scope.pendingChange = true;
        };

        /**
        * Updates article's switches' values on the server.
        *
        * @method save
        */
        // TODO: tests
        $scope.save = function () {
            var articleData;

            $scope.saveInProgress = true;

            articleData = {
                articleId: self.articleData.number,
                language: self.articleData.language,
                switches: $scope.switches
            }

            article.saveSwitches(articleData)
            .finally(function () {
                $scope.pendingChange = false;
                $scope.saveInProgress = false;
            });
        };

        $scope.switches = [];
        $scope.pendingChange = false;  // are there any unsaved changes?
        $scope.saveInProgress = false;  // saving to server in progress?
    }
]);
