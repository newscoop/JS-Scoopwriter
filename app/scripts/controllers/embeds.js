'use strict';

angular.module('authoringEnvironmentApp')
    .controller('EmbedsCtrl', function ($scope) {
        $scope.embeds = [{
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
        }];
    });
