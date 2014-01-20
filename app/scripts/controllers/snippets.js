'use strict';

angular.module('authoringEnvironmentApp')
    .controller('SnippetsCtrl', function ($scope) {
        function decorate(snippet) {
            snippet.backup = function() {
                this.copy = {
                    title: this.title,
                    code: this.code
                };
            };
            snippet.restore = function() {
                this.title = this.copy.title;
                this.code = this.copy.code;
            };
            return snippet;
        };
        $scope.snippets = [{
            id: 1,
            title: 'Sound of the story',
            code: '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/128775977&amp;color=ff6600&amp;auto_play=false&amp;show_artwork=true"></iframe>'
        }, {
            id: 2,
            title: 'Sound of the story 2',
            code: '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/128775977&amp;color=ff6600&amp;auto_play=false&amp;show_artwork=true"></iframe>'
        }, {
            id: 3,
            title: 'Sound of the story 3',
            code: '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/128775977&amp;color=ff6600&amp;auto_play=false&amp;show_artwork=true"></iframe>'
        }].map(decorate);
        $scope.byId = function(id) {
            return _.find($scope.snippets, function(s) {
                return s.id == id;
            });
        };
        $scope.add = function(title, code) {
            $scope.snippets.push(decorate({
                title: title,
                code: code
            }));
        };
        $scope.remove = function(id) {
            _.remove($scope.snippets, function(s) {
                return s.id == id;
            });
        };
    });
