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

        $scope.switches = [];

        article.promise.then(
            function (articleData) {
                self.articleData = articleData;
                return ArticleType.getByName(articleData.type);
            }, $q.reject
        ).then(function (articleType) {
            articleType.fields.forEach(function (field) {
                var enabled;

                if (field.type === 'switch') {
                    // convert raw data to boolean
                    enabled = !!parseInt(self.articleData.fields[field.name]);
                    $scope.switches.push({
                        name: field.name,
                        enabled: enabled
                    });
                }
            });
        });

        $scope.valueChanged = function () {
            // TODO: set dirty flag to true! "modified"
            //this is just for debug, later remove
            console.debug('switches:', $scope.switches);
        };

    }
]);
