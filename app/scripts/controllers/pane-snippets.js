'use strict';
angular.module('authoringEnvironmentApp').controller('PaneSnippetsCtrl', [
    '$scope',
    'article',
    'Snippet',
    function ($scope, article, Snippet) {

        // $scope.byId = function (id) {
        //     return _.find($scope.snippets, function (s) {
        //         return s.id === id;
        //     });
        // };
        // $scope.create = {};
        // $scope.add = function () {
        //     $scope.snippets.push(decorate({
        //         title: $scope.create.title,
        //         code: $scope.create.code
        //     }));
        //     $scope.create = {};
        //     $scope.adding = false;
        // };
        // $scope.cancel = function () {
        //     $scope.create = {};
        //     $scope.adding = false;
        // };
        // $scope.remove = function (id) {
        //     _.remove($scope.snippets, function (s) {
        //         return s.id === id;
        //     });
        // };

        // init: retrieve all article snippets from server
        article.promise.then(function (articleData) {
            $scope.snippets = Snippet.getAllByArticle(
                articleData.number, articleData.language);

            // TODO: add event listeners/handlers on success? or is this done
            // in template, wiring the logic? probably better so that
            // this code stays simple (avoiding callback in controller)

            // ... or maybe add watch and decorate new array
            // items as needed
        });
    }
]);