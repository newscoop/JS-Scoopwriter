'use strict';
angular.module('authoringEnvironmentApp').factory('panes', [
    '$filter',
    function ($filter) {
        var panes = [
                {
                    name: 'Info',
                    id: 'info',
                    icon: 'info',
                    template: 'views/pane-info.html',
                    position: 'right',
                    size: 'small',
                    visible: false,
                    active: false,
                    selected: true
                },
                {
                    name: 'Authors',
                    id: 'authors',
                    icon: 'authors',
                    template: 'views/pane-authors.html',
                    position: 'right',
                    size: 'small',
                    visible: false,
                    active: false,
                    selected: true
                },
                {
                    name: 'Related Articles',
                    id: 'related-articles-panel',
                    icon: 'relatedarticles',
                    template: 'views/pane-related-articles.html',
                    position: 'right',
                    size: 'small',
                    visible: false,
                    active: false,
                    selected: true
                },
                {
                    name: 'Switches',
                    id: 'switches',
                    icon: 'switches',
                    template: 'views/pane-switches.html',
                    position: 'right',
                    size: 'small',
                    visible: false,
                    active: false,
                    selected: true
                },
                {
                    name: 'Topics',
                    id: 'topics',
                    icon: 'topics',
                    template: 'views/pane-topics.html',
                    position: 'right',
                    size: 'small',
                    visible: false,
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
                    visible: false,
                    active: false,
                    selected: true
                },
                {
                    name: 'Slideshows',
                    id: 'slideshows',
                    icon: 'slideshows',
                    template: 'views/pane-slideshows.html',
                    position: 'left',
                    size: 'small',
                    visible: false,
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
                    visible: false,
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
                    visible: false,
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
            visible: function (pane) {
                panes.forEach(function (p) {
                    if (p === pane) {
                        pane.visible = !pane.visible;
                    } else {
                        p.visible = false;
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
                    if (pane.visible) {
                        // i assume that there is a single visible pane for
                        // side at a time
                        layout[pane.position] = pane.size;
                    }
                });
                return layout;
            }
        };

    }
]);
