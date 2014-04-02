'use strict';
angular.module('authoringEnvironmentApp').factory('panes', function ($filter) {
    var panes = [
            {
                name: 'Topics',
                id: 'topics',
                icon: 'chat',
                template: 'views/pane-topics.html',
                position: 'right',
                size: 'small',
                active: false,
                selected: true
            },
            {
                name: 'Images',
                id: 'images',
                icon: 'media',
                template: 'views/pane-draggable.html',
                position: 'left',
                size: 'small',
                active: false,
                selected: true
            },
            {
                name: 'Snippets',
                id: 'snippets',
                icon: 'embeds',
                template: 'views/pane-embed.html',
                position: 'left',
                size: 'small',
                active: false,
                selected: true
            },
            {
                name: 'Comments',
                id: 'comments',
                icon: 'comments',
                template: 'views/pane-comments.html',
                position: 'left',
                size: 'big',
                active: false,
                selected: true
            }
        ];
    panes.layout = {
        right: null,
        left: null
    };
    panes.articleClass = '';
    function classFromLayout(layout) {
        var c = '';
        angular.forEach(layout, function (value, key) {
            switch (value) {
            case 'small':
                c += 'shrink-' + key + ' ';
                break;
            case 'big':
                c += 'shrink-' + key + '-more ';
                break;
            }
        });
        return c;
    }
    // Public API here
    return {
        query: function () {
            return panes;
        },
        active: function (pane) {
            $filter('filter')(panes, { position: pane.position }).forEach(function (p) {
                if (p === pane) {
                    pane.active = !pane.active;
                } else {
                    p.active = false;
                }
            });
            panes.layout = this.layout(panes);
            panes.articleClass = classFromLayout(panes.layout);
        },
        layout: function (panes) {
            var layout = {
                    left: null,
                    right: null
                };
            panes.forEach(function (pane) {
                if (pane.active) {
                    // i assume that there is a single active pane for
                    // side at a time
                    layout[pane.position] = pane.size;
                }
            });
            return layout;
        }
    };
});